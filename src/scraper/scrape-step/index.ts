import { downloaderClassFactory } from './downloader'
import { parserClassFactory } from './parser'
// type imports
import { ScrapeSettings } from '../../settings'
import { ScraperName } from '../../settings/config/types'
import { Tools } from '../../tools'
import { SelectedRow as ParsedValueWithId } from '../../tools/store/queries/select-parsed-values'
import { DownloaderClass } from './downloader'
import { ParserClass } from './parser'

type InputValue = {
  parsedValue: string
  id?: number // no parent id exists for the toplevel scrape step
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

  public constructor(settings: ScrapeSettings, tools: Tools) {
    const scraperName = settings.config.name
    const downloader = downloaderClassFactory(settings, tools)
    const parser = parserClassFactory(settings, tools)

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

  public downloadParseFunction: DownloadParseFunction = async (
    { parsedValue: value, id: parentId },
    incrementIndex
  ) => {
    const { store } = this.tools

    const downloadId = store.qs.insertQueuedDownload({
      scraper: this.scraperName,
      parentId,
      incrementIndex
    })
    const { downloadValue, cacheId, filename, mimeType, byteLength } = await this.downloader.run({
      parentId,
      incrementIndex,
      downloadId,
      value
    })
    const parsedValues = this.parser.run(downloadValue)
    this.scraperLogger.info(`parsed ${parsedValues.length} values from downloadId ${downloadId}`, {
      parsedValues
    })
    this.tools.store.transaction(() => {
      store.qs.updateMarkDownloadComplete({ downloadId, cacheId })
      store.qs.insertBatchParsedValues({
        scraper: this.scraperName,
        parentId,
        downloadId,
        parsedValues,
        format: this.parser.type
      })
      console.log('download is marked complete')
    })()
    console.log('transaction complete')
    this.tools.emitter
      .scraper(this.scraperName)
      .emit('complete', { id: downloadId, filename, mimeType, byteLength })
    return store.qs.selectParsedValues(downloadId)
  }
}

export { ScrapeStep }
