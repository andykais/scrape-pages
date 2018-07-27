import EventEmitter from 'events'
import Emitter from '../emitter'
import Store from '../store'
import Logger from '../logger'
import Queue from '../queue-observable'
import scraper from './scrape-step'
import { mkdirp } from '../util/fs-promise'
import { normalizeConfig } from '../configuration'
import { normalizeOptions } from '../run-options'

class ScrapePages {
  constructor(config) {
    this.config = normalizeConfig(config)
    this.scrapingSetup = scraper(this.config.scrape)
  }

  initDependencies = runParams => {
    this.store = new Store(this.config)
    this.emitter = new Emitter(this.config)
    this.logger = new Logger({ log_level: 3 })
    this.queue = new Queue(runParams, this.emitter.toggler)
  }

  // TODO add parsable input for this first parse step
  runSetup = async runParams => {
    const flatRunParams = normalizeOptions(this.config, runParams)

    this.logger.cli('Making folders.')
    this.scrapingScheme = await this.scrapingSetup(flatRunParams, {
      queue: this.queue,
      emitter: this.emitter,
      logger: this.logger,
      store: this.store
    })

    this.logger.cli('Setting up SQLite database.')
    await this.store.init(runParams)

    this.logger.cli('Begin downloading with inputs', runParams.input)
    return this.scrapingScheme([{}])
  }

  run = runParams => {
    this.initDependencies(runParams)
    this.runSetup(runParams).then(scrapingObservable => {
      const subscription = scrapingObservable.subscribe(
        undefined,
        error => {
          this.emitter.emitError(error)
          subscription.unsubscribe()
          // TODO unsubscribe from queue
        },
        () => {
          // TODO add timer to show how long it took
          this.logger.cli('Done!')
          this.queue.closeQueue()
          this.emitter.emitDone(this.store.queryFor)
        }
      )

      this.emitter.onStop(() => {
        subscription.unsubscribe()
        this.logger.cli('Exited manually.')
      })
    })
    return this.emitter.emitter
  }
  runAsPromise = async runParams => {
    this.initDependencies(runParams)
    const scrapingObservable = await this.runSetup(runParams)
    return scrapingObservable.toPromise()
  }
}

export default ScrapePages
