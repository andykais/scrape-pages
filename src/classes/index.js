import EventEmitter from 'events'
import Logger from '../logger'
import fillInDefaults from '../configuration/fill-in-defaults'
import chooseParser from './parsers'
import chooseSaver from './savers'
import { mkdirp } from '../util/fs-promise'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { takeWhileHardStop } from '../rxjs-operators'
import { assertConfigType } from '../configuration/assert-type'
import Store from '../store'

export class Scraper {
  // constructor({ name, parse, download, scrapeEach }, io) {
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

class ScrapePages {
  constructor(config) {
    assertConfigType(config)
    this.config = fillInDefaults(config)
    this.emitter = new EventEmitter() // dependency inject?
    this.logger = new Logger({ log_level: 3 })
    this.scrapingScheme = new Scraper(this.config.scrape, {
      emitter: this.emitter,
      logger: this.logger
    })
  }

  // TODO add parsable input for this first parse step
  run = async (input = {}, options = {}) => {
    this.logger.info('Begin downloading with inputs', input)
    try {
      if (!options.folder) throw new Error('need a download dir! (for now)')
      if (!this.isValidInput(input)) throw new Error('invalid input')
      await mkdirp(options.folder)
      await this.scrapingScheme.runSetup(options)

      this.scrapingScheme
        .run({ input, options })()
        .subscribe(
          () => {},
          error => {
            this.logger.error(error.toString())
            this.emitter.emit('error', error)
          },
          () => {
            // TODO add timer to show how long it took
            this.logger.info('Done!')
            this.emitter.emit('done')
          }
        )
      return this.emitter
    } catch (e) {
      this.logger.error(e)
      process.exit(1)
    }
  }

  isValidInput = input => {
    if (typeof this.config.input === 'string') {
      const inputKeyIsPresent = input[this.config.input]
      if (!inputKeyIsPresent) return false
    } else if (Array.isArray(this.config.input)) {
      const allInputsArePresent = Object.keys(this.config.input).every(
        key => input[key]
      )
      if (!allInputsArePresent) return false
    }
    return true
  }
}

export default ScrapePages
