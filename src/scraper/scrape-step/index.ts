import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import setDownloaderConfig from './downloader'
import setParserConfig from './parser'
import incrementer from './incrementer'
import { mkdirpSync } from '../../util/fs'
// type imports
import { ScrapeConfig } from '../../configuration/site-traversal/types'
import { FlatRunOptions } from '../../configuration/run-options/types'
import { Dependencies } from '../types'
import { SelectedRow as ParsedValueWithId } from '../../store/queries/select-parsed-values'
import { DownloadParseFunction } from './incrementer'

type ScrapeValue = (parentValues: any[]) => Rx.Observable<any>
type ScrapeStep = (
  config: ScrapeConfig
) => (flatRunParams: FlatRunOptions, dependencies: Dependencies) => ScrapeValue
type InputValue = {
  parsedValue: string
  id?: number // nonexistent
}
export type ParsedValue = InputValue | ParsedValueWithId

// init setup
const scraper = (config: ScrapeConfig) => {
  const setDownloaderOptions = setDownloaderConfig(config)
  const setParserOptions = setParserConfig(config)
  const getIncrementObservable = incrementer(config)
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
    const scrapeNextChild = config.scrapeNext
      ? scraper(config.scrapeNext)(flatRunParams, dependencies)
      : (parentValues: ParsedValue[]) => Rx.empty()

    const downloadParseFunction: DownloadParseFunction = async (
      { parsedValue: value, id: parentId },
      incrementIndex
      // ,scrapeNextIndex
    ) => {
      console.log('download', value)
      if (['image', 'image-page'].includes(config.name))
        console.log('begin', config.name, { value, parentId })
      if (['next-batch-id'].includes(config.name))
        console.log('begin', config.name, { parentId })

      const { id: downloadId } = store.qs.selectCompletedDownload({
        incrementIndex,
        parentId,
        scraper: config.name
      })
      if (downloadId) {
        const parsedValuesWithId = store.qs.selectParsedValues(downloadId)
        if (config.name === 'next-batch-id') console.log(config.name, 'loaded')
        return parsedValuesWithId
      } else {
        console.log(config.name, 'downloading')
        const { downloadValue, downloadId, filename } = await downloader({
          incrementIndex,
          scrapeNextIndex: 0,
          parentId,
          value
        })
        const parsedValues = parser(downloadValue)
        if (['next-batch-id', 'batch-id', 'batch-page'].includes(config.name))
          console.log(config.name, { parsedValues })

        const parsedValuesWithId = store.asTransaction(() => {
          store.qs.updateDownloadToComplete({ downloadId, filename })
          store.qs.insertBatchParsedValues({
            name: config.name,
            parentId,
            downloadId,
            parsedValues
          })
          emitter.forScraper[config.name].emitCompletedDownload(downloadId)
          return store.qs.selectParsedValues(downloadId)
        })()
        return parsedValuesWithId
      }
    }

    // called per each value
    return (parentValues: ParsedValue[]): Rx.Observable<ParsedValue[]> =>
      Rx.from(parentValues).pipe(
        ops.flatMap(
          getIncrementObservable(downloadParseFunction, scrapeNextChild)
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
export default scraper
