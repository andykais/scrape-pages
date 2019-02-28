import { downloaderClassFactory } from './downloader'
import { parserClassFactory } from './parser'
// type imports
import { ScrapeSettings } from '../../settings'
import { ScraperName } from '../../settings/config/types'
import { Tools } from '../../tools'
import { SelectedRow as ParsedValueWithId } from '../../tools/store/queries/select-parsed-values'
import { DownloaderClass } from './downloader'
import { ParserClass } from './parser'
import { DownloadParams } from './downloader/abstract'

type InputValue = {
  parsedValue: string
  id?: number // nonexistent
}
export type ParsedValue = InputValue | ParsedValueWithId
export type DownloadParseFunction = (
  parsedValueWithId: ParsedValue,
  incrementIndex: number
) => Promise<ParsedValue[]>

class ScrapeStep {
  public scraperName: ScraperName
  public config: ScrapeSettings['config']
  private options: ScrapeSettings['options']
  private params: ScrapeSettings['params']
  private tools: Tools
  private scraperLogger: ReturnType<Tools['logger']['scraper']>
  private downloader: DownloaderClass
  private parser: ParserClass

  public constructor(scraperName: ScraperName, settings: ScrapeSettings, tools: Tools) {
    const downloader = downloaderClassFactory(scraperName, settings, tools)
    const parser = parserClassFactory(scraperName, settings, tools)

    const scraperLogger = tools.logger.scraper(scraperName)!

    Object.assign(this, {
      scraperName,
      ...settings,
      tools,
      downloader,
      parser,
      scraperLogger
    })
  }

  private selectCachedValues = (completedDownloadId: number) => {
    const parsedValuesWithId = this.tools.store.qs.selectParsedValues(completedDownloadId)
    this.scraperLogger.info(
      { parsedValuesWithId, completedDownloadId },
      'loaded exact cached values'
    )
    this.tools.emitter.scraper(this.scraperName).emit.completed(completedDownloadId)
    return parsedValuesWithId
  }
  private reInsertCachedValues = (
    matchingDownload: { id: number; filename: string | undefined },
    downloadParams: DownloadParams,
    downloadData: any
  ) => {
    const parsedValuesWithId = this.tools.store.qs.selectParsedValues(matchingDownload.id)
    const strippedParsedValues = parsedValuesWithId.reduce((acc: string[], p) => {
      if (p.parsedValue !== undefined) acc.push(p.parsedValue)
      return acc
    }, [])
    const downloadId: number = this.tools.store.transaction(() => {
      const downloadId = this.tools.store.qs.insertQueuedDownload(
        this.scraperName,
        downloadParams,
        downloadData
      )
      this.tools.store.qs.updateDownloadToComplete({
        downloadId,
        filename: matchingDownload.filename
      })
      this.tools.store.qs.insertBatchParsedValues({
        name: this.scraperName,
        parentId: downloadParams.parentId,
        downloadId,
        parsedValues: strippedParsedValues
      })
      return downloadId
    })()
    this.tools.emitter.scraper(this.scraperName).emit.completed(downloadId)
    return this.tools.store.qs.selectParsedValues(downloadId)
  }
  private reDownloadParseValues = async (
    matchingDownload: { id: number; filename: string | undefined },
    downloadParams: DownloadParams,
    downloadData: any
  ) => {
    const { id: downloadId } = matchingDownload
    this.tools.store.qs.updateCompletedDownloadToQueued(matchingDownload.id)
    const { downloadValue, filename } = await this.downloader.retrieve(
      matchingDownload.id,
      downloadData
    )
    this.tools.emitter.scraper(this.scraperName).emit.queued(downloadId)

    const parsedValues = this.parser.run(downloadValue)
    this.tools.store.transaction(() => {
      this.tools.store.qs.updateDownloadToComplete({ downloadId, filename })
      // TODO this is a problem: we need to delete the values so that re can re-insert them (otherwise we are
      // just duplicating values if they already exist) BUT we cannot delete them fully or else we lose all
      // the children from the download as well.
      //
      // Possible solutions:
      // a. only insert parsed values that do not exist yet
      // b. create a third table for scrapestep caches.
      //  Never delete from this table, and delete down the tree for downloads & parsedTree
      //  Sometimes we will replace parse values though
      // c. remove the foreign key and find a way to query for scrapers top-down instead of bottom-up
      //
      // this.tools.store.qs.deleteParsedValuesOnDownloadId(downloadId)
      this.tools.store.qs.insertBatchParsedValues({
        name: this.scraperName,
        parentId: downloadParams.parentId,
        downloadId,
        parsedValues
      })
    })()
    this.tools.emitter.scraper(this.scraperName).emit.completed(downloadId)
    const p = this.tools.store.qs.selectParsedValues(downloadId)
    if (this.scraperName === 'gallery') console.log(p)
    return p
  }

  public downloadParseValues = async (downloadParams: DownloadParams, downloadData: any) => {
    const downloadId = this.tools.store.qs.insertQueuedDownload(
      this.scraperName,
      downloadParams,
      this.downloader.type === 'identity' ? undefined : downloadData
    )
    this.tools.emitter.scraper(this.scraperName).emit.queued(downloadId)

    const { downloadValue, filename } = await this.downloader.retrieve(downloadId, downloadData)
    const parsedValues = this.parser.run(downloadValue)
    this.tools.store.transaction(() => {
      this.tools.store.qs.updateDownloadToComplete({ downloadId, filename })
      this.tools.store.qs.insertBatchParsedValues({
        name: this.scraperName,
        parentId: downloadParams.parentId,
        downloadId,
        parsedValues
      })
    })()
    this.tools.emitter.scraper(this.scraperName).emit.completed(downloadId)
    return this.tools.store.qs.selectParsedValues(downloadId)
  }

  public downloadParseFunction: DownloadParseFunction = async (
    { parsedValue: value, id: parentId },
    incrementIndex
  ) => {
    const completedDownloadId = this.tools.store.qs.selectCompletedDownloadId({
      incrementIndex,
      parentId,
      scraper: this.scraperName
    })
    const downloadParams = {
      incrementIndex,
      parentId,
      value
    }
    const downloadData = this.downloader.constructDownload(downloadParams)
    const matchingDownload =
      completedDownloadId === undefined && !this.options.cache
        ? undefined
        : this.tools.store.qs.selectMatchingDownloadId(downloadData)

    // if (this.scraperName === 'gallery')
    //   console.log({
    //     // downloadData,
    //     matchingDownload,
    //     completedDownloadId
    //   })

    // if (!this.options.duplicates && matchingDownload) return []
    if (this.options.cache && completedDownloadId) {
      if (this.scraperName === 'gallery') console.log('selectCachedValues')
      return this.selectCachedValues(completedDownloadId)
    } else if (this.options.cache && matchingDownload) {
      if (this.scraperName === 'gallery') console.log('reInsertCachedValues')
      return this.reInsertCachedValues(matchingDownload, downloadParams, downloadData)
    } else if (
      !this.options.cache &&
      completedDownloadId !== undefined &&
      matchingDownload !== undefined &&
      completedDownloadId === matchingDownload.id
    ) {
      if (this.scraperName === 'gallery') console.log('reDownloadParseValues')
      return this.reDownloadParseValues(matchingDownload, downloadParams, downloadData)
    } else {
      if (this.scraperName === 'gallery') console.log('downloadParseValues')
      return this.downloadParseValues(downloadParams, downloadData)
    }
  }

  //public downloadParseFunction: DownloadParseFunction = async (
  //  { parsedValue: value, id: parentId },
  //  incrementIndex
  //) => {
  //  const { store, emitter } = this.tools
  //  /**
  //   * question: should I query for both a true child and one with matching download data?
  //   * question: what is expected when I want no cache, but I change the inputs?
  //   *  answer: Likely I want to keep both, so I will replace ONLY if the downloadData remains the same
  //   * question: what is expected when I want no cache and an entry is no longer present on the webpage?
  //   *  answer: I will keep it all the same. There is a use case for only caching for performance, and not
  //   *          entries, but I cant guaruntee that is the only use case, so more is better. Track that
  //   *          yourself with <scraper>:queued if you really care (or just restart the whole dang download).
  //   * question: what is expected when I want cache and I find a matching downloadData?
  //   *  answer: I should add a new entry. If a page has two of the same image, I want both images
  //   * question: should prevent duplicates stop the scraper in its tracks, or continue with an existing entry?
  //   *  answer: it should stop in its tracks. This makes my life easier, and is means expected positions for
  //   *          parsed values
  //   *
  //   * with cache false:
  //   *  if a selectCompletedDownload exists:
  //   *    if constructed downloadData is the same for both:
  //   *      [ ] re-download and replace in that entry file
  //   *    else:
  //   *      [X] download into a new entry
  //   * with cache true:
  //   *  if a selectCompletedDownload exists:
  //   *    [X] select and be done with it
  //   *  else if a matching downloadData exists:
  //   *    [ ] select and if preventDuplicates === false then re-insert under the new parentId
  //   */
  //  const completedDownloadId = store.qs.selectCompletedDownloadId({
  //    incrementIndex,
  //    parentId,
  //    scraper: this.scraperName
  //  })
  //  const matchingDownload =
  //    completedDownloadId === undefined ? undefined : store.qs.selectMatchingDownloadId({})

  //  if (this.scraperName === 'gallery')
  //    console.log(this.scraperName, this.options.cache, completedDownloadId)

  //  if (this.options.cache && completedDownloadId !== undefined) {
  //    console.log('we will get here once we fix gallery to replace-in-place')
  //    const parsedValuesWithId = store.qs.selectParsedValues(completedDownloadId)
  //    this.scraperLogger.info(
  //      { parsedValuesWithId, completedDownloadId },
  //      'loaded exact cached values'
  //    )
  //    emitter.scraper(this.scraperName).emit.completed(completedDownloadId)
  //    return parsedValuesWithId
  //  } else if (this.options.cache && matchingDownload !== undefined) {
  //    // I should be inserting a new one
  //    //
  //    // select parsed values with old ids
  //    // insert a completed download
  //    // map to new ids
  //    // insert cached parsed values with new ids
  //    //
  //    // TODO investigate what having duplicates does to ordering

  //    const parsedValuesWithId = store.qs.selectParsedValues(matchingDownload.id)
  //    this.scraperLogger.info(
  //      { parsedValuesWithId, matchingDownload },
  //      'loaded matching cached values'
  //    )
  //    emitter.scraper(this.scraperName).emit.completed(matchingDownload.id)
  //    return parsedValuesWithId

  //    // } else if (
  //    //   !this.options.cache && // not necessary, but more clear
  //    //   completedDownloadId !== undefined &&
  //    //   matchingDownloadId !== undefined
  //    // ) {
  //    //   // retrieve
  //    //   // DONT insert into downloads table
  //    //   // parse
  //    //   // update values in parse
  //    //   console.log('yeah')
  //  } else {
  //    const { downloadValue, downloadId, filename } = await this.downloader.run({
  //      incrementIndex,
  //      parentId,
  //      value
  //    })
  //    if (this.scraperName === 'gallery') console.log(downloadId)
  //    const parsedValues = this.parser.run(downloadValue)

  //    store.transaction(() => {
  //      store.qs.updateDownloadToComplete({ downloadId, filename })
  //      store.qs.insertBatchParsedValues({
  //        name: this.scraperName,
  //        parentId,
  //        downloadId,
  //        parsedValues
  //      })
  //    })()
  //    const parsedValuesWithId = store.qs.selectParsedValues(downloadId)

  //    this.scraperLogger.info({ parsedValuesWithId, downloadId }, 'inserted new values')
  //    emitter.scraper(this.scraperName).emit.completed(downloadId)
  //    return parsedValuesWithId
  //  }
  //}
}

export { ScrapeStep }
