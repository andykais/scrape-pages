import EventEmitter from 'events'
import Store from '../store'
import Logger from '../logger'
import Scraper from './scrape-step'
import { mkdirp } from '../util/fs-promise'
import { fillInDefaults as fillInDefaultConfigs } from '../configuration'
import { fillInDefaults as fillInDefaultOptions } from '../run-options'

class ScrapePages {
  constructor(config) {
    this.config = fillInDefaultConfigs(config)
    this.emitter = new EventEmitter() // dependency inject?
    this.logger = new Logger({ log_level: 3 })
    this.store = new Store(this.config)
    this.scrapingScheme = new Scraper(this.config.scrape, {
      emitter: this.emitter,
      logger: this.logger,
      store: this.store
    })
  }

  // TODO add parsable input for this first parse step
  run = async (input = {}, options) => {
    this.options = fillInDefaultOptions(this.config, options)
    // create database file during run, not setup
    try {
      if (!this.isValidInput(input)) throw new Error('invalid input')

      this.logger.cli('Setting up SQLite database.')
      await this.store.init(this.options)
      await this.store.getOrderedScrapers(['media'])

      this.logger.cli('Begin downloading with inputs', input)
      await mkdirp(this.options.folder)
      await this.scrapingScheme.runSetup(this.options)

      this.scrapingScheme
        .run({ input, options: this.options })()
        .subscribe(
          () => {},
          error => {
            this.logger.error(error.toString())
            this.emitter.emit('error', error)
            process.exit(1)
          },
          () => {
            // TODO add timer to show how long it took
            this.logger.cli('Done!')
            this.emitter.emit('done')
          }
        )
      return this.emitter
    } catch (e) {
      this.logger.error(e.code, e.message)
      process.exit(1)
    }
  }

  isValidInput = input =>
    Object.keys(this.config.input).every(key => input[key])
}

export default ScrapePages
