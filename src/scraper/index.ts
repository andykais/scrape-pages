import * as path from 'path'
import { initTools } from '../tools'
import { mkdirp, rmrf, exists, read, writeFile } from '../util/fs'
import { ActiveScraperLockError, MismatchedVersionError } from '../util/errors'
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
        emitter.on('stop', async () => {
          logger.info('Exiting manually.')
          const { emitter, ...internalTools } = tools
          for (const tool of Object.values(internalTools)) tool.cleanup()
          await this.writeMetadata({ scraperActive: false })
          emitter.emit('done')
          emitter.cleanup()
          logger.info(`Done.`)
        })

        await this.ensureSafeFolder()
        await this.initFolders()
        await this.writeMetadata({ scraperActive: true })
        for (const tool of Object.values(tools)) tool.initialize()
        emitter.emit('initialized')
        logger.info('Starting scraper.')

        const program = compileProgram(this.settings, tools)

        const subscription = program.subscribe({
          error: async (error: Error) => {
            await this.writeMetadata({ scraperActive: false })
            emitter.emit('error', error)
            logger.error(error)
            subscription.unsubscribe()
            for (const tool of Object.values(tools)) tool.cleanup()
          },
          complete: () => {
            const { emitter, ...internalTools } = tools
            for (const tool of Object.values(internalTools)) tool.cleanup()

            // a nicety so we can await "initialized" and then start listening for "done"
            setTimeout(async () => {
              await this.writeMetadata({ scraperActive: false })
              emitter.emit('done')
              emitter.cleanup()
              logger.info('Done.')
            }, 0)
          }
        })
        emitter.on('stop', subscription.unsubscribe)
      } catch (error) {
        emitter.emit('error', error)
        if (logger.isInitialized) logger.error(error)
        for (const tool of Object.values(tools)) tool.cleanup()
      }
    })()
    return tools.emitter.getBaseEmitter()
  }

  public analyzeConfig = () => ({
    inputs: this.settings.config.input,
    scraperNames: [...this.settings.flatConfig.keys()]
  })

  private async ensureSafeFolder() {
    const { folder, forceStart } = this.settings.paramsInit
    if (forceStart) return

    const metadataFile = path.resolve(folder, 'metadata.json')
    if (await exists(metadataFile)) {
      try {
        const { version: oldVersion, scraperActive } = JSON.parse(await read(metadataFile))

        if (scraperActive) throw new ActiveScraperLockError()
        else if (oldVersion !== process.env.PACKAGE_VERSION) {
          throw new MismatchedVersionError(oldVersion, process.env.PACKAGE_VERSION)
        }
      } catch (e) {
        if (e.name === 'SyntaxError') throw new ActiveScraperLockError()
        else throw e
      }
    }
  }

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

  private async writeMetadata(data: { scraperActive: boolean }) {
    const { paramsInit, optionsInit, configInit } = this.settings
    const metadataFile = path.resolve(paramsInit.folder, 'metadata.json')

    const metadata = {
      ...data,
      version: process.env.PACKAGE_VERSION,
      settingsInit: { configInit, optionsInit, paramsInit }
    }
    await writeFile(metadataFile, JSON.stringify(metadata))
  }
}
