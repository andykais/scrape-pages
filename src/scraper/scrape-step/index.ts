import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import VError from 'verror'
import { downloaderClassFactory } from './downloader'
import { parserClassFactory } from './parser'
import { incrementer } from './incrementer'
// type imports
import { ScrapeConfig } from '../../configuration/site-traversal/types'
import { FlatRunOptions } from '../../configuration/run-options/types'
import { Dependencies } from '../types'
import { SelectedRow as ParsedValueWithId } from '../../store/queries/select-parsed-values'
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
  return (flatRunParams: FlatRunOptions, dependencies: Dependencies) => {
    const runParams = flatRunParams[config.name]
    const downloader = downloaderClassFactory(config, runParams, dependencies)
    const parser = parserClassFactory(config, runParams, dependencies)

    const { queue, store, emitter, logger } = dependencies
    const scraperLogger = logger.scraper(config.name)
    const children = childrenSetup.map(child =>
      child(flatRunParams, dependencies)
    )
    const scrapeNextChild = config.scrapeNext
      ? scraperStep(config.scrapeNext)(flatRunParams, dependencies)
      : (parentValues: ParsedValue[]) => Rx.empty()

    const downloadParseFunction: DownloadParseFunction = async (
      { parsedValue: value, id: parentId },
      incrementIndex,
      scrapeNextIndex = 0
    ) => {
      const { id: downloadId } = store.qs.selectCompletedDownload({
        incrementIndex,
        parentId,
        scraper: config.name
      })
      if (downloadId) {
        const parsedValuesWithId = store.qs.selectParsedValues(downloadId)
        scraperLogger.cachedValues(downloadId, parsedValuesWithId)
        return parsedValuesWithId
      } else {
        const { downloadValue, downloadId, filename } = await downloader.run({
          incrementIndex,
          scrapeNextIndex: 0,
          parentId,
          value
        })
        const parsedValues = parser.run(downloadValue)

        const parsedValuesWithId = store.asTransaction(() => {
          store.qs.updateDownloadToComplete({ downloadId, filename })
          store.qs.insertBatchParsedValues({
            name: config.name,
            parentId,
            downloadId,
            parsedValues
          })
          emitter.scraper[config.name].emitCompletedDownload(downloadId)
          return store.qs.selectParsedValues(downloadId)
        })()

        scraperLogger.newValues(downloadId, parsedValuesWithId)
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
