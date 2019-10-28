import * as path from 'path'
import { initTools } from '../tools'
import { mkdirp, rmrf, exists, read, writeFile } from '../util/fs'
import { getSettings } from '../settings'
import { Logger } from '../tools/logger'
import { Store } from '../tools/store'
import { compileProgram } from './flow'
// type imports
import { QueryFn } from '../tools/store/querier-entrypoint'
import { Settings } from '../settings'
import { ConfigInit } from '../settings/config/types'
import { OptionsInit } from '../settings/options/types'
import { ParamsInit } from '../settings/params/types'
import { ThenArg } from '../util/types'

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
  const query = Store.querierFactory(settings)

  return new ScraperProgram(settings, query)
}

class ScraperProgram {
  public constructor(private settings: Settings, public query: QueryFn) {}

  public start = async () => {
    await this.initFolders()
    await this.writeMetadata()
    // const { emitter, logger } = initStaticTools(this.settings)
    // const { queue, store } = initIoTools(this.settings)
    const tools = initTools(this.settings)
    const { emitter, queue, logger } = tools

    logger.debug({ inspected: this.settings.config }, 'config')
    logger.debug({ inspected: this.settings.flatConfig }, 'flatConfig')
    logger.debug({ inspected: this.settings.flatOptions }, 'flatOptions')
    logger.debug({ inspected: this.settings.flatParams }, 'flatParams')

    // create the observable
    const program = compileProgram(this.settings, tools)

    // start running the observable
    // setTimeout is necessary so that any listeners setup after start() is called are setup before downloads begin
    let subscription: ReturnType<typeof program.subscribe>
    setTimeout(() => {
      subscription = program.subscribe({
        error: function(error: Error) {
          emitter.emit('error', error)
          this.unsubscribe()
          queue.closeQueue()
        },
        complete: () => {
          queue.closeQueue()
          emitter.emit('done')
          logger.info('Done!')
        }
      })
    }, 0)
    emitter.on('stop', () => {
      logger.info('Exiting manually.')
      queue.closeQueue()
      // necessary so we can listen to 'stop' event right away, but wait to cancel the observable until after it is started
      setTimeout(() => {
        subscription.unsubscribe()
        emitter.emit('done')
        logger.info(`Done.`)
      }, 0)
    })

    return emitter.getBaseEmitter()
  }

  public analyzeConfig = () => ({
    inputs: this.settings.config.input,
    scraperNames: [...this.settings.flatConfig.keys()]
  })

  private initFolders = async () => {
    const { paramsInit, flatParams } = this.settings
    // remove folders if specified
    if (paramsInit.cleanFolder) await rmrf(paramsInit.folder)
    // create folders
    await mkdirp(paramsInit.folder)
    for (const { folder } of flatParams.values()) await mkdirp(folder)
    // safely rename existing log files
    await Logger.rotateLogFiles(paramsInit.folder)
  }

  private writeMetadata = async () => {
    const { paramsInit, optionsInit, configInit } = this.settings
    const metadataFile = path.resolve(paramsInit.folder, 'metadata.json')
    const logger = new Logger(this.settings)
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
}
