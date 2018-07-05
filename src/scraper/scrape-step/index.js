import chooseParser from './parsers'
import chooseSaver from './savers'
import { mkdirp } from '../../util/fs-promise'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { takeWhileHardStop } from '../../util/rxjs-operators'

class Scraper {
  constructor(config, io) {
    const { name, parse, download, scrapeEach } = config
    const childless = !Boolean(scrapeEach.length)
    const { expect } = parse || {}

    this.name = name
    this.save = chooseSaver({ config, expect, ...io })
    this.parse = chooseParser({ config, expect, ...io })
    this.emitter = io.emitter
    this.logger = io.logger
    this.children = scrapeEach.map(scrape => new Scraper(scrape, io))
  }

  runSetup = async options => {
    await mkdirp(`${options.folder}/${this.name}`)
    await Promise.all(this.children.map(child => child.runSetup(options)))
  }

  // TODO recursively get operators instead of recusive run
  // then make flat observable
  //
  // TODO allow for increments like range(0, 100) where some may respond with nothing
  run = params => (parentValue, parentIndexes = []) =>
    this.save
      .run(params, parentIndexes)(parentValue)
      .pipe(
        ops.map(this.parse.run(params)),
        takeWhileHardStop(parsed => parsed.length),
        ops.mergeMap((parsed, incrementIndex) =>
          Rx.from(parsed).pipe(
            ops.mergeMap((value, parsedIndex) =>
              this.children.map(child =>
                child.run(params)(value, [
                  ...parentIndexes,
                  incrementIndex,
                  parsedIndex
                ])
              )
            )
          )
        ),
        ops.mergeAll()
      )
}
export default Scraper
