import EventEmitter from 'events'
import Store from '../store'
import Logger from '../logger'
import scraper from './scrape-step'
import { mkdirp } from '../util/fs-promise'
import { fillInDefaults as fillInDefaultConfigs } from '../configuration'
import { fillInDefaults as fillInDefaultOptions } from '../run-options'

class ScrapePages {
  constructor(config) {
    this.config = fillInDefaultConfigs(config)
    this.emitter = new EventEmitter() // dependency inject?
    this.logger = new Logger({ log_level: 3 })
    this.store = new Store(this.config)
    this.scrapingSetup = scraper({
      config: this.config.scrape,
      emitter: this.emitter,
      logger: this.logger,
      store: this.store
    })
  }

  // TODO add parsable input for this first parse step
  runSetup = async (input = {}, optionsAll, optionsNamed = {}) => {
    const options = fillInDefaultOptions(this.config, optionsAll, optionsNamed)
    if (!this.isValidInput(input)) throw new Error('invalid input')

    this.logger.cli('Making folders.')
    await mkdirp(optionsAll.folder)
    this.scrapingScheme = await this.scrapingSetup(input, options)

    this.logger.cli('Setting up SQLite database.')
    await this.store.init(optionsAll.folder)
    const scraperValues = await this.store.getOrderedScrapers(['media'])
    console.log({ scraperValues })

    this.logger.cli('Begin downloading with inputs', input)
    return this.scrapingScheme([undefined])
  }

  run = async (...args) => {
    const scrapingObservable = await this.runSetup(...args)
    scrapingObservable.subscribe(
      undefined,
      error => {
        this.emitter.emit('error', error)
        scrapingObservable.unsubscribe()
      },
      () => {
        // TODO add timer to show how long it took
        this.logger.cli('Done!')
        this.emitter.emit('done')
      }
    )
    return this.emitter
  }
  runAsPromise = async (...args) => {
    const scrapingObservable = await this.runSetup(...args)
    return scrapingObservable.toPromise()
  }

  isValidInput = input =>
    Object.keys(this.config.input).every(key => input[key])
}

export default ScrapePages
