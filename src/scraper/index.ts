import Emitter from '../emitter'
import Store from '../store'
import Logger from '../logger'
import Queue from '../queue-observable'
import scraper from './scrape-step'
import { normalizeConfig } from '../configuration'
import { normalizeOptions } from '../run-options'
// type imports
import { LogType } from '../logger'
import { Config, ConfigInit } from '../configuration/types'
import { RunOptionsInit } from '../run-options/types'

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
  runSetup = async (runParams: RunOptionsInit) => {
    const flatRunParams = normalizeOptions(this.config, runParams)

    this.logger.info('Making folders.')
    this.scrapingScheme = await this.configuredScraper(flatRunParams, {
      queue: this.queue,
      emitter: this.emitter,
      logger: this.logger,
      store: this.store
    })

    this.logger.info('Setting up SQLite database.')
    await this.store.init(runParams)

    this.logger.info('Begin downloading with inputs', runParams.input)
    return this.scrapingScheme([{ parsedValue: '' }])
  }

  run = (runParams: RunOptionsInit, logLevel: LogType = 'ERROR') => {
    // init dependencies
    this.store = new Store(this.config)
    this.emitter = new Emitter(this.config, this.store)
    this.logger = new Logger({ logLevel })
    this.queue = new Queue(
      runParams,
      this.emitter.getRxEventStream('useRateLimiter')
    )

    this.runSetup(runParams).then(scrapingObservable => {
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
        subscription.unsubscribe()
        this.logger.info('Exited manually.')
      })
    })
    return this.emitter.emitter
  }
}

export default ScrapePages
