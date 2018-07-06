import EventEmitter from 'events'
import Emitter from '../emitter'
import Store from '../store'
import Logger from '../logger'
import Queue from '../queue-observable'
import scraper from './scrape-step'
import { mkdirp } from '../util/fs-promise'
import { fillInDefaults as fillInDefaultConfigs } from '../configuration'
import { fillInDefaults as fillInDefaultOptions } from '../run-options'

class ScrapePages {
  constructor(config) {
    this.config = fillInDefaultConfigs(config)
    this.scrapingSetup = scraper(this.config.scrape)
  }

  // TODO add parsable input for this first parse step
  runSetup = async (input = {}, optionsAll, optionsNamed = {}) => {
    const flatOptions = fillInDefaultOptions(
      this.config,
      optionsAll,
      optionsNamed
    )
    if (!this.isValidInput(input)) throw new Error('invalid input')

    this.store = new Store(this.config)
    this.emitter = new Emitter()
    this.logger = new Logger({ log_level: 3 })
    this.queue = new Queue(optionsAll, this.emitter.toggler)

    this.logger.cli('Making folders.')
    await mkdirp(optionsAll.folder)
    this.scrapingScheme = await this.scrapingSetup({
      input,
      flatOptions,
      queue: this.queue,
      emitter: this.emitter,
      logger: this.logger,
      store: this.store
    })

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
        this.emitter.emitError(error)
        scrapingObservable.unsubscribe()
      },
      () => {
        // TODO add timer to show how long it took
        this.logger.cli('Done!')
        this.emitter.emitDone()
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
