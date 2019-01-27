import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { downloaderClassFactory } from './downloader'
import { parserClassFactory } from './parser'
import { wrapError } from '../../util/error'
// type imports
import { ScraperName, ScrapeConfig } from '../../settings/config/types'
import { Options } from '../../settings/options/types'
import { Tools } from '../../tools'
import { SelectedRow as ParsedValueWithId } from '../../tools/store/queries/select-parsed-values'
import { DownloaderClass } from './downloader'
import { ParserClass } from './parser'

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
  public config: ScrapeConfig
  private options: Options
  // private flatOptions: FlatOptions
  private tools: Tools
  private scraperLogger: ReturnType<Tools['logger']['scraper']>
  private downloader: DownloaderClass
  private parser: ParserClass
  // public incrementObservableFunction: ReturnType<typeof incrementer>
  // private children: ScrapeStep[]

  public constructor(
    scraperName: ScraperName,
    scraperConfig: ScrapeConfig,
    scraperOptions: Options,
    tools: Tools
  ) {
    this.scraperName = scraperName
    this.config = scraperConfig
    this.options = scraperOptions
    this.tools = tools

    // const getIncrementObservable = incrementer(config)
    // this.children = config.scrapeEach.map(
    //   scrapeConfig => new ScrapeStep(scrapeConfig, flatOptions, tools)
    // )
    // const scraperOptions = flatOptions.get(this.scraperName)!
    this.downloader = downloaderClassFactory(
      scraperName,
      scraperConfig,
      scraperOptions,
      tools
    )
    this.parser = parserClassFactory(
      scraperName,
      scraperConfig,
      scraperOptions,
      tools
    )

    this.scraperLogger = tools.logger.scraper(scraperName)!
    // const scrapeNextChild = config.scrapeNext
    //   ? new ScrapeStep(config.scrapeNext, flatOptions, tools)
    //   : new IdentityScrapeStep()
    // this.incrementObservableFunction = incrementer(
    //   config,
    //   this.downloadParseFunction,
    //   scrapeNextChild
    // )
  }

  // todo start using Rx.merge(parentValues.map(this.incrementObservableFunction))
  // right now, observables per set of parsed values are 1 + #values * ( increments + scrapeNext || 0 )
  // this can remove the first one
  // public run: typeof AbstractScrapeStep.prototype.run = (
  //   parentValues: ParsedValue[]
  // ): Rx.Observable<ParsedValue[]> =>
  //   Rx.from(parentValues).pipe(
  //     ops.flatMap(this.incrementObservableFunction),
  //     ops.catchError(wrapError(`scraper '${this.scraperName}'`)),
  //     ops.flatMap(
  //       parsedValues =>
  //         this.children.length
  //           ? this.children.map(child => child.run(parsedValues))
  //           : [Rx.of(parsedValues)]
  //     ),
  //     ops.mergeAll()
  //   )

  public downloadParseFunction: DownloadParseFunction = async (
    { parsedValue: value, id: parentId },
    incrementIndex
  ) => {
    const { store, emitter } = this.tools
    const { id: downloadId } = store.qs.selectCompletedDownload({
      incrementIndex,
      parentId,
      scraper: this.scraperName
    })
    if (downloadId) {
      const parsedValuesWithId = store.qs.selectParsedValues(downloadId)
      this.scraperLogger.info(
        { parsedValuesWithId, downloadId },
        'loaded cached values'
      )
      return parsedValuesWithId
    } else {
      const { downloadValue, downloadId, filename } = await this.downloader.run(
        {
          incrementIndex,
          parentId,
          value
        }
      )
      const parsedValues = this.parser.run(downloadValue)

      store.transaction(() => {
        store.qs.updateDownloadToComplete({ downloadId, filename })
        store.qs.insertBatchParsedValues({
          name: this.scraperName,
          parentId,
          downloadId,
          parsedValues
        })
        emitter.scraper(this.scraperName).emit.completed(downloadId)
      })()
      const parsedValuesWithId = store.qs.selectParsedValues(downloadId)

      this.scraperLogger.info(
        { parsedValuesWithId, downloadId },
        'inserted new values'
      )
      return parsedValuesWithId
    }
  }
}

export { ScrapeStep }
