import * as Rx from 'rxjs'
import VError from 'verror'
import { Emitter } from '../emitter'
import { Store } from '../store'
import { Logger, LogOptions } from '../logger'
import { Queue } from '../queue'
import { scraperStep } from './scrape-step'
import { mkdirp, rmrf } from '../util/fs'
import { normalizeConfig } from '../configuration/site-traversal'
import { normalizeOptions } from '../configuration/run-options'
// type imports
import { Config, ConfigInit } from '../configuration/site-traversal/types'
import {
  RunOptionsInit,
  FlatRunOptions
} from '../configuration/run-options/types'

class ScrapePages {
  private config: Config
  private configuredScraper: ReturnType<typeof scraperStep>
  private scrapingScheme: ReturnType<ReturnType<typeof scraperStep>>
  // dependencies
  private store: Store
  private emitter: Emitter
  private logger: Logger
  private queue: Queue

  public constructor(config: ConfigInit) {
    this.config = normalizeConfig(config)
    this.configuredScraper = scraperStep(this.config.scrape)
  }

  private initResources = async (
    runParams: RunOptionsInit,
    flatRunParams: FlatRunOptions
  ) => {
    if (runParams.cleanFolder) {
      this.logger.info(`Cleaning ${runParams.folder}`)
      await rmrf(runParams.folder)
    }

    this.logger.info('Making folders.')
    await mkdirp(runParams.folder)
    for (const { folder } of Object.values(flatRunParams)) await mkdirp(folder)

    this.logger.info('Setting up SQLite database.')
    // syncronous db creation
    this.store.init(runParams)

    this.logger.info('Begin downloading with inputs', runParams.input)
  }

  // TODO add parsable input for this first parse step
  private initDependencies = (runParams: RunOptionsInit, logOptions?: LogOptions) => {
    const flatRunParams = normalizeOptions(this.config, runParams)

    this.store = new Store(this.config)
    this.emitter = new Emitter(this.config, this.store)
    this.logger = new Logger(logOptions)
    const rateLimiterEventStream = this.emitter.getRxEventStream(
      'useRateLimiter'
    ) as Rx.Observable<boolean> // deal with incoming values on this event as truthy or falsey
    this.queue = new Queue(runParams, flatRunParams, rateLimiterEventStream)

    this.scrapingScheme = this.configuredScraper(flatRunParams, {
      queue: this.queue,
      emitter: this.emitter,
      logger: this.logger,
      store: this.store
    })

    return Rx.concat(
      this.initResources(runParams, flatRunParams),
      this.scrapingScheme([{ parsedValue: '' }])
    )
  }

  public run = (runParams: RunOptionsInit, logOptions?: LogOptions) => {
    const scrapingObservable = this.initDependencies(runParams, logOptions)
    const subscription = scrapingObservable.subscribe(
      undefined,
      error => {
        this.emitter.emitError(VError.fullStack(error))
        subscription.unsubscribe()
        this.queue.closeQueue()
      },
      () => {
        // TODO add timer to show how long it took
        this.queue.closeQueue()
        this.emitter.emitDone()
        this.logger.info('Done!')
      }
    )

    this.emitter.onStop(() => {
      this.logger.info('Exiting manually.')
      this.queue.closeQueue()
      subscription.unsubscribe()
      this.logger.info('Done!')
      this.emitter.emitDone()
    })
    return this.emitter.emitter
  }
}

export { ScrapePages }
