import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import VError from 'verror'
import { downloaderClassFactory } from './downloader'
import { parserClassFactory } from './parser'
import { incrementer } from './incrementer'
// type imports
import { ScrapeConfig } from '../../settings/config/types'
import { FlatOptions } from '../../settings/options/types'
import { Tools } from '../../tools'
import { SelectedRow as ParsedValueWithId } from '../../tools/store/queries/select-parsed-values'
import { DownloadParseFunction } from './incrementer'

type InputValue = {
  parsedValue: string
  id?: number // nonexistent
}
export type ParsedValue = InputValue | ParsedValueWithId

// init setup
const scraperStep = (config: ScrapeConfig) => {
  const getIncrementObservable = incrementer(config)
  const childrenSetup = config.scrapeEach.map(scrapeConfig =>
    scraperStep(scrapeConfig)
  )

  // run setup
  return (flatOptions: FlatOptions, tools: Tools) => {
    const options = flatOptions.get(config.name)!
    const downloader = downloaderClassFactory(config, options, tools)
    const parser = parserClassFactory(config, options, tools)

    const { store, emitter, logger } = tools
    const scraperLogger = logger.scraper(config.name)!
    const children = childrenSetup.map(child => child(flatOptions, tools))
    const scrapeNextChild = config.scrapeNext
      ? scraperStep(config.scrapeNext)(flatOptions, tools)
      : () => Rx.empty()

    const downloadParseFunction: DownloadParseFunction = async (
      { parsedValue: value, id: parentId },
      incrementIndex
    ) => {
      const { id: downloadId } = store.qs.selectCompletedDownload({
        incrementIndex,
        parentId,
        scraper: config.name
      })
      if (downloadId) {
        const parsedValuesWithId = store.qs.selectParsedValues(downloadId)
        scraperLogger.info(
          { parsedValuesWithId, downloadId },
          'loaded cached values'
        )
        return parsedValuesWithId
      } else {
        const { downloadValue, downloadId, filename } = await downloader.run({
          incrementIndex,
          parentId,
          value
        })
        const parsedValues = parser.run(downloadValue)

        store.transaction(() => {
          store.qs.updateDownloadToComplete({ downloadId, filename })
          store.qs.insertBatchParsedValues({
            name: config.name,
            parentId,
            downloadId,
            parsedValues
          })
          emitter.scraper[config.name].emitCompletedDownload(downloadId)
        })()
        const parsedValuesWithId = store.qs.selectParsedValues(downloadId)

        scraperLogger.info(
          { parsedValuesWithId, downloadId },
          'inserted new values'
        )
        return parsedValuesWithId
      }
    }

    // called per each value
    return (parentValues: ParsedValue[]): Rx.Observable<ParsedValue[]> =>
      Rx.from(parentValues).pipe(
        ops.flatMap(
          getIncrementObservable(downloadParseFunction, scrapeNextChild)
        ),
        ops.catchError(e =>
          Rx.throwError(
            new VError({ name: e.name, cause: e }, `scraper '${config.name}'`)
          )
        ),
        ops.flatMap(
          parsedValues =>
            children.length
              ? children.map(child => child(parsedValues))
              : [Rx.of(parsedValues)]
        ),
        ops.mergeAll()
      )
  }
}
export { scraperStep }
