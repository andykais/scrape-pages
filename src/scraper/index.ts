import { initTools } from '../tools'
import { ScrapeStep } from './scrape-step'
import { mkdirp, rmrf } from '../util/fs'
import { getSettings, getScrapeStepSettings } from '../settings'
import { normalizeConfig } from '../settings/config'
import { normalizeOptions } from '../settings/options'
import { normalizeParams } from '../settings/params'
import { Logger } from '../tools/logger'
import { structureScrapers } from './flow'
import { mapObject } from '../util/object'
// type imports
import { Settings } from '../settings'
import { Config, ConfigInit } from '../settings/config/types'
import { OptionsInit, FlatOptions } from '../settings/options/types'
import { ParamsInit, FlatParams } from '../settings/params/types'

const initFolders = async ({ paramsInit, flatParams }: Settings) => {
  if (paramsInit.cleanFolder) await rmrf(paramsInit.folder)

  await mkdirp(paramsInit.folder)
  for (const { folder } of flatParams.values()) await mkdirp(folder)

  await Logger.rotateLogFiles(paramsInit.folder)
}

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
  const scrapingScheme = structureScrapers(settings, scrapers.toObject())(settings.config.structure)
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
