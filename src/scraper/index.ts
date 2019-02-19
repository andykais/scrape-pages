import { initTools } from '../tools'
import { ScrapeStep } from './scrape-step'
import { mkdirp, rmrf } from '../util/fs'
import { normalizeConfig } from '../settings/config'
import { normalizeOptions } from '../settings/options'
import { Logger } from '../tools/logger'
import { structureScrapers } from './flow'
import { mapObject } from '../util/object'
// type imports
import { Config, ConfigInit } from '../settings/config/types'
import { OptionsInit, FlatOptions } from '../settings/options/types'

const initFolders = async (config: Config, optionsInit: OptionsInit, flatOptions: FlatOptions) => {
  if (optionsInit.cleanFolder) await rmrf(optionsInit.folder)

  await mkdirp(optionsInit.folder)
  for (const { folder } of flatOptions.values()) await mkdirp(folder)

  await Logger.rotateLogFiles(optionsInit.folder)
}

export const scrape = async (configInit: ConfigInit, optionsInit: OptionsInit) => {
  const config = normalizeConfig(configInit)
  const flatOptions = normalizeOptions(config, optionsInit)
  await initFolders(config, optionsInit, flatOptions)
  const tools = initTools(config, optionsInit, flatOptions)
  // create the observable
  const scrapers = mapObject(
    config.defs,
    (scrapeConfig, name) => new ScrapeStep(name, scrapeConfig, flatOptions.getOrThrow(name), tools)
  )
  const scrapingScheme = structureScrapers(config, scrapers)(config.structure)
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
