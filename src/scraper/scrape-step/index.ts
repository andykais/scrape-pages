import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import setDownloaderConfig from './downloader'
import setParserConfig from './parser'
import { mkdirpSync } from '../../util/fs'
import { fromAsyncGenerator } from '../../util/rxjs/observables'
import { okToIncrement } from './downloader/ok-to-increment'
import { ScrapeConfig } from '../../configuration/site-traversal/types'
import { FlatRunOptions } from '../../configuration/run-options/types'
import { Dependencies } from '../types'

type ScrapeValue = (parentValues: any[]) => Rx.Observable<any>
type ScrapeStep = (
  config: ScrapeConfig
) => (flatRunParams: FlatRunOptions, dependencies: Dependencies) => ScrapeValue
type InsertedValue = {
  parsedValue: string
  id?: number
}
// init setup
const scraper = (config: ScrapeConfig) => {
  const setDownloaderOptions = setDownloaderConfig(config)
  const setParserOptions = setParserConfig(config)
  const childrenSetup = config.scrapeEach.map(scrapeConfig =>
    scraper(scrapeConfig)
  )

  // run setup
  return (flatRunParams: FlatRunOptions, dependencies: Dependencies) => {
    const runParams = flatRunParams[config.name]
    const downloader = setDownloaderOptions(runParams, dependencies)
    const parser = setParserOptions()

    const { queue, store, emitter } = dependencies
    // simpler to keep this synchronous
    mkdirpSync(runParams.folder)
    const children = childrenSetup.map(child =>
      child(flatRunParams, dependencies)
    )

    // called per each value
    return (parentValues: InsertedValue[]): Rx.Observable<any> =>
      Rx.from(parentValues).pipe(
        ops.flatMap(({ parsedValue: value, id: parentId }) =>
          fromAsyncGenerator(async function*() {
            let incrementIndex = 0
            do {
              const { id: downloadId } = store.qs.selectCompletedDownload({
                incrementIndex,
                parentId,
                scraper: config.name
              })
              if (downloadId) {
                const parsedValuesWithId = store.qs.selectParsedValues(
                  downloadId
                )
                yield parsedValuesWithId
              } else {
                const {
                  downloadValue,
                  downloadId,
                  filename
                } = await downloader({
                  incrementIndex,
                  loopIndex: 0,
                  parentId,
                  value
                })
                const parsedValues = parser(downloadValue)

                const parsedValuesWithId = store.asTransaction(() => {
                  store.qs.updateDownloadToComplete({ downloadId, filename })
                  store.qs.insertBatchParsedValues({
                    name: config.name,
                    parentId,
                    downloadId,
                    parsedValues
                  })
                  emitter.forScraper[config.name].emitCompletedDownload(
                    downloadId
                  )
                  return store.qs.selectParsedValues(downloadId)
                })()
                yield parsedValuesWithId
              }
              incrementIndex++
            } while (okToIncrement(config))
          }).pipe(
            // TODO add filter and use hard stop
            ops.takeWhile((parsedValues: InsertedValue[]) =>
              Boolean(parsedValues.length)
            ),
            ops.flatMap(parsedValues =>
              children.map(child => child(parsedValues))
            ),
            ops.mergeAll()
          )
        )
      )
  }
}
export default scraper
