import * as path from 'path'
import { initTools } from '../tools'
import { mkdirp, rmrf, exists, read, writeFile } from '../util/fs'
import { getSettings } from '../settings'
import { Logger } from '../tools/logger'
import { Store } from '../tools/store'
import { Database } from '../tools/store/database'
import { compileProgram } from './flow'
// type imports
import { QueryFn } from '../tools/store/querier-entrypoint'
import { Settings } from '../settings'
import { ConfigInit } from '../settings/config/types'
import { OptionsInit } from '../settings/options/types'
import { ParamsInit } from '../settings/params/types'

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

  public start = () => {
    const tools = initTools(this.settings)
    const { emitter, logger } = tools

      // program starts detached so we can return the emitter synchronously
    ;(async () => {
      try {
        emitter.on('stop', () => {
          logger.info('Exiting manually.')
          const { emitter, ...internalTools } = tools
          for (const tool of Object.values(internalTools)) tool.cleanup()
          emitter.emit('done')
          emitter.cleanup()
          logger.info(`Done.`)
        })

        await this.initFolders()
        for (const tool of Object.values(tools)) tool.initialize()
        await this.writeMetadata(logger)
        emitter.emit('initialized')

        const program = compileProgram(this.settings, tools)

        const subscription = program.subscribe({
          error: function(error: Error) {
            emitter.emit('error', error)
            logger.error(error)
            this.unsubscribe()
            for (const tool of Object.values(tools)) tool.cleanup()
          },
          complete: () => {
            const { emitter, ...internalTools } = tools
            for (const tool of Object.values(internalTools)) tool.cleanup()

            // a nicety so we can await "initialized" and then start listening for "done"
            setTimeout(() => {
              emitter.emit('done')
              emitter.cleanup()
              logger.info('Done.')
            }, 0)
          }
        })
        emitter.on('stop', subscription.unsubscribe)
      } catch (error) {
        emitter.emit('error', error)
        logger.error(error)
        for (const tool of Object.values(tools)) tool.cleanup()
      }
    })()
    return tools.emitter.getBaseEmitter()
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

  private writeMetadata = async (logger: Logger) => {
    const { paramsInit, optionsInit, configInit } = this.settings
    const metadataFile = path.resolve(paramsInit.folder, 'metadata.json')
    // const logger = new Logger(this.settings)
    // logger.initialize()
    if (await exists(metadataFile)) {
      const { version: oldVersion } = JSON.parse(await read(metadataFile))
      if (oldVersion !== process.env.PACKAGE_VERSION) {
        const logMessage = `This folder was created by an older version of scrape-pages! Old: ${oldVersion}, New: ${process.env.PACKAGE_VERSION}. Consider adding the param 'cleanFolder: true' and starting fresh.`
        logger.warn(logMessage)
      }
    } else if (await exists(Database.getFilePath(paramsInit.folder))) {
      logger.warn('Starting a scraper in an existing scraper location.')
    } else {
      logger.warn('Starting fresh scraper.')
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
