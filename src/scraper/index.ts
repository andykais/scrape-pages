import * as Rx from 'rxjs'
import Emitter from '../emitter'
import Store from '../store'
import Logger from '../logger'
import Queue from '../queue'
import scraper from './scrape-step'
import { normalizeConfig } from '../configuration/site-traversal'
import { normalizeOptions } from '../configuration/run-options'
// type imports
import { LogType } from '../logger'
import { Config, ConfigInit } from '../configuration/site-traversal/types'
import { RunOptionsInit } from '../configuration/run-options/types'

class ScrapePages {
  config: Config
  configuredScraper: ReturnType<typeof scraper>
  scrapingScheme: ReturnType<ReturnType<typeof scraper>>
  // dependencies
  store: Store
  emitter: Emitter
  logger: Logger
  queue: Queue

  constructor(config: ConfigInit) {
    this.config = normalizeConfig(config)
    this.configuredScraper = scraper(this.config.scrape)
  }

  // TODO add parsable input for this first parse step
  runSetup = (runParams: RunOptionsInit, logLevel: LogType) => {
    const flatRunParams = normalizeOptions(this.config, runParams)

    // init dependencies
    this.store = new Store(this.config)
    this.emitter = new Emitter(this.config, this.store)
    this.logger = new Logger({ logLevel })
    const rateLimiterEventStream = this.emitter.getRxEventStream(
      'useRateLimiter'
    ) as Rx.Observable<boolean> // deal with incoming values on this event as truthy or falsey
    this.queue = new Queue(runParams, flatRunParams, rateLimiterEventStream)

    this.logger.info('Making folders.')
    // calls synchronous mkdirp
    this.scrapingScheme = this.configuredScraper(flatRunParams, {
      queue: this.queue,
      emitter: this.emitter,
      logger: this.logger,
      store: this.store
    })

    this.logger.info('Setting up SQLite database.')
    // syncronous db creation
    this.store.init(runParams)

    this.logger.info('Begin downloading with inputs', runParams.input)
    return this.scrapingScheme([{ parsedValue: '' }])
  }

  run = (runParams: RunOptionsInit, logLevel: LogType = 'ERROR') => {
    const scrapingObservable = this.runSetup(runParams, logLevel)
    const subscription = scrapingObservable.subscribe(
      undefined,
      error => {
        this.emitter.emitError(error)
        subscription.unsubscribe()
        this.queue.closeQueue()
      },
      () => {
        // TODO add timer to show how long it took
        this.logger.info('Done!')
        this.queue.closeQueue()
        this.emitter.emitDone()
      }
    )

    this.emitter.onStop(() => {
      this.queue.closeQueue()
      subscription.unsubscribe()
      this.logger.info('Exited manually.')
    })
    return this.emitter.emitter
  }
}

export default ScrapePages
