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
  return async scraperRunParams => {
    const runParams = {
      ...scraperRunParams,
      options: scraperRunParams.flatOptions[config.name]
    }
    const downloader = downloaderSetup(runParams)
    const parser = parserSetup(runParams)

    const { queue, store, options } = runParams
    await mkdirp(options.folder)
    const children = await Promise.all(
      childrenSetup.map(child => child(scraperRunParams))
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

              const {
                id: downloadId,
                complete
              } = await store.getCachedDownload(url.toString())

              if (complete) {
                const parsedValues = await store.getParsedValuesFromDownloadId(
                  downloadId
                )
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
