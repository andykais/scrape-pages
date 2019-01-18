import { initTools } from '../tools'
import { scraperStep } from './scrape-step'
import { mkdirp, rmrf } from '../util/fs'
import { normalizeConfig } from '../settings/config'
import { normalizeOptions } from '../settings/options'
// type imports
import { Config, ConfigInit } from '../settings/config/types'
import { OptionsInit, FlatOptions } from '../settings/options/types'

const initFolders = async (
  config: Config,
  optionsInit: OptionsInit,
  flatOptions: FlatOptions
) => {
  if (optionsInit.cleanFolder) await rmrf(optionsInit.folder)

  await mkdirp(optionsInit.folder)
  for (const { folder } of flatOptions.values()) await mkdirp(folder)
}

export const scrape = async (
  configInit: ConfigInit,
  optionsInit: OptionsInit
) => {
  const config = normalizeConfig(configInit)
  const flatOptions = normalizeOptions(config, optionsInit)
  await initFolders(config, optionsInit, flatOptions)
  const tools = initTools(config, optionsInit, flatOptions)
  // create the observable
  const scrapingScheme = scraperStep(config.scrape)(flatOptions, tools)
  const scrapingObservable = scrapingScheme([{ parsedValue: '' }])
  // start running the observable
  const { emitter, queue, logger, store } = tools
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
  return {
    on: emitter.getBoundOn(),
    emit: emitter.getBoundEmit(),
    query: store.queryFor
  }
}
