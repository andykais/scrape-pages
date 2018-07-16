import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import chooseParser from './parser'
import chooseDownloader, { incrementShouldKeepGoing } from './downloader'
import { mkdirp } from '../../util/fs-promise'
import { fromAsyncGenerator } from '../../util/rxjs-observables'
import { okToIncrement } from './downloader/ok-to-increment'

// init setup
const scraper = config => {
  const downloaderSetup = chooseDownloader(config)
  const parserSetup = chooseParser(config)
  const childrenSetup = config.scrapeEach.map(scrapeConfig =>
    scraper(scrapeConfig)
  )

  // run setup
  return async (flatRunParams, dependencies) => {
    const runParams = flatRunParams[config.name]
    const downloader = downloaderSetup(runParams, dependencies)
    const parser = parserSetup(runParams, dependencies)

    const { queue, store, emitter } = dependencies
    await mkdirp(runParams.folder)
    const children = await Promise.all(
      childrenSetup.map(child => child(flatRunParams, dependencies))
    )

    // called per each value
    return parentValues => {
      return Rx.from(parentValues).pipe(
        ops.flatMap(({ parsedValue: value, id: parentId }) =>
          fromAsyncGenerator(async function*() {
            let incrementIndex = 0
            do {
              const { id: downloadId } = await store.selectCompletedDownload({
                incrementIndex,
                parentId
              })
              if (downloadId) {
                const parsedValuesWithId = await store.selectParsedValues(
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

                await store.updateDownloadToComplete({ downloadId, filename })
                await store.insertBatchParsedValues({
                  name: config.name,
                  parentId,
                  downloadId,
                  parsedValues
                })
                emitter.forScraper[config.name].emitCompletedDownload(
                  downloadId
                )
                const parsedValuesWithId = await store.selectParsedValues(
                  downloadId
                )
                yield parsedValuesWithId
              }
              incrementIndex++
            } while (okToIncrement(config, incrementIndex))
          }).pipe(
            ops.takeWhile(parsedValues => parsedValues.length),
            ops.flatMap(parsedValues =>
              children.map(child => child(parsedValues))
            ),
            ops.mergeAll()
          )
        )
      )
    }
  }
}
export default scraper
