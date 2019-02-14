import { downloaderClassFactory } from './downloader'
import { parserClassFactory } from './parser'
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
  private tools: Tools
  private scraperLogger: ReturnType<Tools['logger']['scraper']>
  private downloader: DownloaderClass
  private parser: ParserClass

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
  }

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
      emitter.scraper(this.scraperName).emit.completed(downloadId)
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
      })()
      const parsedValuesWithId = store.qs.selectParsedValues(downloadId)

      this.scraperLogger.info(
        { parsedValuesWithId, downloadId },
        'inserted new values'
      )
      emitter.scraper(this.scraperName).emit.completed(downloadId)
      return parsedValuesWithId
    }
  }
}

export { ScrapeStep }
