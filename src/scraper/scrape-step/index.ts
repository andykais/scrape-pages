import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { downloaderClassFactory } from './downloader'
import { parserClassFactory } from './parser'
import { incrementer } from './incrementer'
import { wrapError } from '../../util/error'
// type imports
import { ScraperName, ScrapeConfig } from '../../settings/config/types'
import { FlatOptions } from '../../settings/options/types'
import { Tools } from '../../tools'
import { SelectedRow as ParsedValueWithId } from '../../tools/store/queries/select-parsed-values'
import { DownloadParseFunction } from './incrementer'
import { DownloaderClass } from './downloader'
import { ParserClass } from './parser'

type InputValue = {
  parsedValue: string
  id?: number // nonexistent
}
export type ParsedValue = InputValue | ParsedValueWithId

abstract class AbstractScrapeStep {
  public abstract run: (
    parsedValues: ParsedValue[]
  ) => Rx.Observable<ParsedValue[]>
}
class IdentityScrapeStep extends AbstractScrapeStep {
  public run: typeof AbstractScrapeStep.prototype.run = () => Rx.empty()
}
class ScrapeStep extends AbstractScrapeStep {
  private scraperName: ScraperName
  private config: ScrapeConfig
  private flatOptions: FlatOptions
  private tools: Tools
  private scraperLogger: ReturnType<Tools['logger']['scraper']>

  private downloader: DownloaderClass
  private parser: ParserClass
  private incrementObservableFunction: ReturnType<typeof incrementer>
  private children: ScrapeStep[]

  public constructor(
    config: ScrapeConfig,
    flatOptions: FlatOptions,
    tools: Tools
  ) {
    super()
    this.scraperName = config.name
    this.config = config
    this.flatOptions = flatOptions
    this.tools = tools

    // const getIncrementObservable = incrementer(config)
    this.children = config.scrapeEach.map(
      scrapeConfig => new ScrapeStep(scrapeConfig, flatOptions, tools)
    )
    const scraperOptions = flatOptions.get(this.scraperName)!
    this.downloader = downloaderClassFactory(config, scraperOptions, tools)
    this.parser = parserClassFactory(config, scraperOptions, tools)

    this.scraperLogger = tools.logger.scraper(this.scraperName)!
    const scrapeNextChild = config.scrapeNext
      ? new ScrapeStep(config.scrapeNext, flatOptions, tools)
      : new IdentityScrapeStep()
    this.incrementObservableFunction = incrementer(
      config,
      this.downloadParseFunction,
      scrapeNextChild
    )
  }

  public run: typeof AbstractScrapeStep.prototype.run = (
    parentValues: ParsedValue[]
  ): Rx.Observable<ParsedValue[]> =>
    Rx.from(parentValues).pipe(
      ops.flatMap(this.incrementObservableFunction),
      ops.catchError(wrapError(`scraper '${this.scraperName}'`)),
      ops.flatMap(
        parsedValues =>
          this.children.length
            ? this.children.map(child => child.run(parsedValues))
            : [Rx.of(parsedValues)]
      ),
      ops.mergeAll()
    )

  private downloadParseFunction: DownloadParseFunction = async (
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

export { ScrapeStep, IdentityScrapeStep }
