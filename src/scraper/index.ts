import * as path from 'path'
import { initTools } from '../tools'
import { mkdirp, rmrf, exists, read, writeFile } from '../util/fs'
import { getSettings } from '../settings'
import { Logger } from '../tools/logger'
import { Store } from '../tools/store'
import { compileProgram } from './flow'
// type imports
import { Settings } from '../settings'
import { ConfigInit } from '../settings/config/types'
import { OptionsInit } from '../settings/options/types'
import { ParamsInit } from '../settings/params/types'
import { ThenArg } from '../util/types'

const initFolders = async ({ paramsInit, flatParams }: Settings) => {
  // remove folders if specified
  if (paramsInit.cleanFolder) await rmrf(paramsInit.folder)
  // create folders
  await mkdirp(paramsInit.folder)
  for (const { folder } of flatParams.values()) await mkdirp(folder)
  // safely rename existing log files
  await Logger.rotateLogFiles(paramsInit.folder)
}
const writeMetadata = async (settings: Settings) => {
  const { paramsInit, optionsInit, configInit } = settings
  const metadataFile = path.resolve(paramsInit.folder, 'metadata.json')
  const logger = new Logger(settings)
  if (await exists(metadataFile)) {
    const { version: oldVersion } = JSON.parse(await read(metadataFile))
    if (oldVersion !== process.env.PACKAGE_VERSION) {
      const logMessage = `This folder was created by an older version of scrape-pages! Old: ${oldVersion}, New: ${process.env.PACKAGE_VERSION}. Consider adding the param 'cleanFolder: true' and starting fresh.`
      logger.warn(logMessage)
    }
  } else {
    logger.warn('This folder was created by an older version of scrape-pages!')
  }
  await writeFile(
    metadataFile,
    JSON.stringify({
      version: process.env.PACKAGE_VERSION,
      settingsInit: { configInit, optionsInit, paramsInit }
    })
  )
}

const startScraping = async (settings: Settings) => {
  await initFolders(settings)
  await writeMetadata(settings)
  const tools = initTools(settings)
  const { emitter, queue, logger } = tools

  logger.info({ inspected: settings.config }, 'config')
  logger.info({ inspected: settings.flatConfig }, 'flatConfig')
  logger.info({ inspected: settings.flatOptions }, 'flatOptions')
  logger.info({ inspected: settings.flatParams }, 'flatParams')

  // create the observable
  const program = compileProgram(settings, tools)

  // start running the observable
  // initting subscription is necessary so that any listeners setup after start() is called are setup before downloads begin
  let subscription: ReturnType<typeof program.subscribe>
  setTimeout(() => {
    subscription = program.subscribe({
      error: (error: Error) => {
        emitter.emit.error(error)
        subscription.unsubscribe()
        queue.closeQueue()
      },
      complete: () => {
        queue.closeQueue()
        emitter.emit.done()
        logger.info('Done!')
      }
    })
  }, 0)
  emitter.on.stop(() => {
    logger.info('Exiting manually.')
    queue.closeQueue()
    // necessary so we can listen to 'stop' event right away, but wait to cancel the observable until after it is started
    setTimeout(() => {
      subscription.unsubscribe()
      emitter.emit.done()
      logger.info(`Done.`)
    }, 0)
  })

  return {
    on: emitter.getBoundOn(),
    emit: emitter.getBoundEmit()
  }
}

export type Start = () => ReturnType<typeof startScraping>
export type Emitter = ThenArg<ReturnType<Start>>
export type Query = ReturnType<typeof Store.querierFactory>
/**
 * scrape is the entrypoint for this library
 *
 * @param configInit 'what' is going to be scraped (the actual urls and parse strings)
 * @param optionsInit 'how' is the site going to be scraped (mostly how downloads should behave)
 * @param paramsInit 'who' is going to be scraped (settings specific to each run)
 */
export const scrape = (
  configInit: ConfigInit,
  optionsInit: OptionsInit,
  paramsInit: ParamsInit
) => {
  const settings = getSettings(configInit, optionsInit, paramsInit)

  const start = () => startScraping(settings)
  const query = Store.querierFactory(settings)

  return { start, query, settings }
}
