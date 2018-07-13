import chooseParser from './parser'
import chooseDownloader, { incrementShouldKeepGoing } from './downloader'
import { mkdirp } from '../../util/fs-promise'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { takeWhileHardStop } from '../../util/rxjs-operators'
import { constructUrl } from './construct-url'

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

    const { queue, store } = dependencies
    await mkdirp(runParams.folder)
    const children = await Promise.all(
      childrenSetup.map(child => child(flatRunParams, dependencies))
    )

    // called per each value
    return parentValues => {
      return Rx.from(parentValues).pipe(
        ops.flatMap(({ parsedValue: value, id: parentId }) =>
          Rx.interval().pipe(
            ops.flatMap(async incrementIndex => {
              const url = constructUrl(config, runParams, {
                value,
                incrementIndex
              })

              if (config.name === 'post-list') console.log('post-list')
              if (config.name === 'downloadOnly') console.log('downloadOnly')
              if (config.name === 'score') {
                console.log(config.name, url)
              }

              const {
                id: downloadId,
                complete
              } = await store.getCachedDownload(url.toString())

              if (complete) {
                const parsedValues = await store.getParsedValuesFromDownloadId(
                  downloadId
                )
                if (config.name === 'downloadOnly')
                  console.log('downloadOnly', parsedValues.length)
                return parsedValues
              } else {
                const downloadId = await store.insertQueuedDownload({
                  scraper: config.name,
                  loopIndex: 0,
                  incrementIndex,
                  url: url.toString()
                })

                const { downloadValue, filename } = await downloader(url)

                const parsedValues = parser(downloadValue)

                await store.markDownloadComplete({ downloadId, filename })
                await store.insertBatchParsedValues({
                  name: config.name,
                  parentId,
                  downloadId,
                  parsedValues
                })
                const parsedValuesWithId = await store.getParsedValuesFromDownloadId(
                  downloadId
                )
                if (config.name === 'downloadOnly') {
                  console.log(config.name, parsedValuesWithId.length)
                }
                return parsedValuesWithId
              }
            }, 1),
            takeWhileHardStop(incrementShouldKeepGoing(config)),
            ops.flatMap(parsedValues =>
              children.map(child => child(parsedValues))
            ),
            ops.mergeAll()
            // ops.mergeAll() // not sure if necessary??
          )
        )
      )
    }
  }
}
export default scraper
