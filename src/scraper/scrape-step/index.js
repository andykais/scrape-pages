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
    return (parentValues, parentId) => {
      return Rx.from(parentValues).pipe(
        ops.flatMap(value =>
          Rx.interval().pipe(
            ops.flatMap(async incrementIndex => {
              // db write start, download, db write complete
              const loopIndex = 0
              const { downloadValue, downloadId } = await downloader({
                incrementIndex,
                loopIndex,
                value
              })

              const { parsedValues, nextParentId } = await parser({
                parentId,
                downloadId,
                value: downloadValue
              })
              if (config.name === 'post') console.log(parsedValues)
              return { parsedValues, nextParentId }
            }, 1),
            takeWhileHardStop(incrementShouldKeepGoing(config)),
            ops.flatMap(({ parsedValues, nextParentId }) =>
              children.map(child => child(parsedValues, nextParentId))
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
