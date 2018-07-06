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
    this.store = io.store
    this.children = scrapeEach.map(scrape => new Scraper(scrape, io))
  }

  runSetup = async options => {
    this.options = options[this.name] // TODO decide if making each run stateful is a good idea or not
    await mkdirp(this.options.folder)
    this.save.runSetup(this.options)
    this.parse.runSetup(this.options)
    await Promise.all(this.children.map(child => child.runSetup(options)))
  }

  // TODO recursively get operators instead of recusive run
  // then make flat observable
  //
  // TODO allow for increments like range(0, 100) where some may respond with nothing
  run = params => (parentValue, parentId) => {
    // console.log(this.name, parentValue)

    return this.save
      .run(params, parentId)(parentValue)
      .pipe(
        ops.mergeMap(this.parse.run(params), 1),
        ops.tap(p => console.log(p.value.length)),
        takeWhileHardStop(parsed => parsed.value.length),
        ops.mergeMap(({ value, downloadId }) =>
          Rx.from(value).pipe(
            ops.mergeMap(async (value, parseIndex) => {
              const nextParentId = this.store.insertParsedValue({
                name: this.name,
                parseIndex,
                value,
                downloadId,
                parentId
              })
              // console.log(value)
              const c = this.children.map(child =>
                child.run(params)(value, nextParentId)
              )
              // console.log(c)
              return c
            }),
            ops.mergeAll()
          )
        ),
        // this.logger.tap(),
        ops.mergeAll()
        // ops.mergeAll()
        // this.logger.tap()
      )
  }
}
export default Scraper
