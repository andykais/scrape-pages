import chooseParser from './parser'
import chooseDownloader, { incrementShouldKeepGoing } from './downloader'
import { mkdirp } from '../../util/fs-promise'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { takeWhileHardStop } from '../../util/rxjs-operators'

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

    await mkdirp(runParams.options.folder)
    const children = await Promise.all(
      childrenSetup.map(child => child(scraperRunParams))
    )

    // called per each value
    return parentValues => {
      return Rx.from(parentValues).pipe(
        ops.flatMap(({ parsedValue: value, id: parentId }) =>
          Rx.interval().pipe(
            ops.flatMap(async incrementIndex => {
              // db write start, download, db write complete
              const loopIndex = 0
              const { downloadValue, downloadId } = await downloader({
                incrementIndex,
                loopIndex,
                value
              })

              const parsedValues = await parser({
                parentId,
                downloadId,
                value: downloadValue
              })
              console.log(parsedValues, {
                progressing: runParams.queue.inProgress,
                queued: runParams.queue.pending
              })
              return parsedValues
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
