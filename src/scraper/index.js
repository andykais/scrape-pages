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

  initDependencies = (input, optionsAll) => {
    this.store = new Store(this.config)
    this.emitter = new Emitter()
    this.logger = new Logger({ log_level: 3 })
    this.queue = new Queue(optionsAll, this.emitter.toggler)
    console.log('initted dependencies')
  }

  // TODO add parsable input for this first parse step
  runSetup = async (input = {}, optionsAll, optionsNamed = {}) => {
    const flatOptions = fillInDefaultOptions(
      this.config,
      optionsAll,
      optionsNamed
    )
    if (!this.isValidInput(input)) throw new Error('invalid input')

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

    this.logger.cli('Begin downloading with inputs', input)
    return this.scrapingScheme([{}])
  }

  run = (...args) => {
    this.initDependencies(...args)
    this.runSetup(...args).then(scrapingObservable => {
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
          // this.store.db
          // .all('SELECT id, complete, url FROM downloads WHERE complete = 1')
          // .then(v => console.log('downloaded', v.length))
          this.store
            .getOrderedScrapers(['post', 'post-list'])
            .then(output =>
              console.log('parsed', output.map(o => o.parsedValue))
            )
        }
      )
    })
    return this.emitter.emitter
  }
  runAsPromise = async (...args) => {
    this.initDependencies(...args)
    const scrapingObservable = await this.runSetup(...args)
    return scrapingObservable.toPromise()
  }

  isValidInput = input =>
    Object.keys(this.config.input).every(key => input[key])
}

export default ScrapePages
