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

  initDependencies = runParams => {
    this.store = new Store(this.config)
    this.emitter = new Emitter()
    this.logger = new Logger({ log_level: 3 })
    this.queue = new Queue(runParams, this.emitter.toggler)
    console.log('initted dependencies')
  }

  // TODO add parsable input for this first parse step
  // runSetup = async ()
  runSetup = async runParams => {
    const flatRunParams = fillInDefaultOptions(this.config, runParams)
    if (!this.isValidInput(runParams.input)) throw new Error('invalid input')

    this.logger.cli('Making folders.')
    this.scrapingScheme = await this.scrapingSetup(flatRunParams, {
      queue: this.queue,
      emitter: this.emitter,
      logger: this.logger,
      store: this.store
    })

    this.logger.cli('Setting up SQLite database.')
    await this.store.init(runParams)
    // console.log(await this.store.db.all(`SELECT parsedValue FROM parsedTree WHERE scraper in ('post')`))
    // const scraperValues = await this.store.getOrderedScrapers([
    // 'post',
    // 'post-list'
    // ])
    // console.log(
    // scraperValues
    // .map(({ id, url, parseIndex, parsedValue, recurseDepth}) => [url])
    // // .map(({ url, parsedValue }) => ({ url, value: parsedValue }))
    // )
    // process.exit(0)

    this.logger.cli('Begin downloading with inputs', runParams.input)
    return this.scrapingScheme([{}])
  }

  run = runParams => {
    this.initDependencies(runParams)
    this.runSetup(runParams).then(scrapingObservable => {
      scrapingObservable.subscribe(
        undefined,
        error => {
          this.emitter.emitError(error)
          scrapingObservable.unsubscribe()
          // TODO unsubscribe from queue
        },
        () => {
          // TODO add timer to show how long it took
          this.logger.cli('Done!')
          this.queue.closeQueue()
          this.emitter.emitDone()
          this.store
            .getOrderedScrapers(['title', 'score'])
            .then(output =>
              console.log(output.map(o => o.parsedValue))
            )
        }
      )
    })
    return this.emitter.emitter
  }
  runAsPromise = async runParams => {
    this.initDependencies(runParams)
    const scrapingObservable = await this.runSetup(runParams)
    return scrapingObservable.toPromise()
  }

  isValidInput = input =>
    Object.keys(this.config.input).every(key => input[key])
}

export default ScrapePages
