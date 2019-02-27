import { initTools, initStore } from '../tools'
import { ScrapeStep } from './scrape-step'
import { mkdirp, rmrf } from '../util/fs'
import { getSettings, getScrapeStepSettings } from '../settings'
import { Logger } from '../tools/logger'
import { structureScrapers } from './flow'
// type imports
import { Settings } from '../settings'
import { ConfigInit } from '../settings/config/types'
import { OptionsInit } from '../settings/options/types'
import { ParamsInit } from '../settings/params/types'

const initFolders = async ({ paramsInit, flatParams }: Settings) => {
  // remove folders if specified
  if (paramsInit.cleanFolder) await rmrf(paramsInit.folder)
  // create folders
  await mkdirp(paramsInit.folder)
  for (const { folder } of flatParams.values()) await mkdirp(folder)
  // safely rename existing log files
  await Logger.rotateLogFiles(paramsInit.folder)
}

/**
 * scrape is the entrypoint for this library
 *
 * @param configInit 'what' is going to be scraped (the actual urls and parse strings)
 * @param optionsInit 'how' is the site going to be scraped (mostly how downloads should behave)
 * @param paramsInit 'who' is going to be scraped (settings specific to each run)
 */
export const scrape = async (
  configInit: ConfigInit,
  optionsInit: OptionsInit,
  paramsInit: ParamsInit
) => {
  const settings = getSettings(configInit, optionsInit, paramsInit)

  await initFolders(settings)
  const tools = initTools(settings)

  const scrapers = getScrapeStepSettings(settings).map(
    (scrapeSettings, name) => new ScrapeStep(name, scrapeSettings, tools)
  )

  // create the observable
  const scrapingScheme = structureScrapers(settings, scrapers)(settings.config.run)
  const scrapingObservable = scrapingScheme([{ parsedValue: '' }])
  // start running the observable
  const { emitter, queue, logger, store } = tools
  // necessary so that any listeners setup after function is called are setup before downloads begin
  setTimeout(() => {
    const subscription = scrapingObservable.subscribe({
      error: (error: Error) => {
        emitter.emit.error(error)
        subscription.unsubscribe()
        queue.closeQueue()
      },
      complete: () => {
        // TODO add timer to show how long it took
        queue.closeQueue()
        emitter.emit.done()
        logger.info('Done!')
      }
    })
    emitter.on.stop(() => {
      logger.info('Exiting manually.')
      queue.closeQueue()
      subscription.unsubscribe()
      logger.info('Done!')
      emitter.emit.done()
    })
  }, 0)

  return {
    on: emitter.getBoundOn(),
    emit: emitter.getBoundEmit(),
    query: store.query
  }
}
