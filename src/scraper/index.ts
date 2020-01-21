import * as path from 'path'
import { initTools } from '../tools'
import { mkdirp, rmrf, exists, read, writeFile } from '../util/fs'
import { ActiveScraperLockError, MismatchedVersionError } from '../util/errors'
import { getSettings } from '../settings'
import { Logger } from '../tools/logger'
import { Store } from '../tools/store'
import { compileProgram } from './flow'
// type imports
import { Tools } from '../tools'
import { QueryFn } from '../tools/store/querier-entrypoint'
import { Settings } from '../settings'
import { ConfigInit } from '../settings/config/types'
import { OptionsInit } from '../settings/options/types'
import { ParamsInit } from '../settings/params/types'

// export const scrape = (
//   configInit: ConfigInit,
//   optionsInit: OptionsInit,
//   paramsInit: ParamsInit
// ) => {
//   return new ScraperProgram(configInit, optionsInit, paramsInit)
//   // const settings = getSettings(configInit, optionsInit, paramsInit)
//   // const query = Store.querierFactory(settings)

//   // return new ScraperProgram(settings, query)
// }

export class ScraperProgram {
  private settings: Settings
  private tools: Tools

  public emitter: Tools['emitter']

  public query: QueryFn

  /**
   * instantiate a scraper
   *
   * @param configInit 'what' is going to be scraped (the actual urls and parse strings)
   * @param optionsInit 'how' is the site going to be scraped (mostly how downloads should behave)
   * @param paramsInit 'who' is going to be scraped (settings specific to each run)
   */
  public constructor(configInit: ConfigInit, optionsInit: OptionsInit, paramsInit: ParamsInit) {
    this.settings = getSettings(configInit, optionsInit, paramsInit)
    this.query = Store.querierFactory(this.settings)
    this.tools = initTools(this.settings)
    this.emitter = this.tools.emitter
  }

  public start = async () => {
    const { emitter, logger } = this.tools

    try {
      // TODO this doesnt do anything, lets move it down to the other stop listener
      emitter.on('stop', async () => {
        logger.info('Exiting manually.')
        const { emitter, ...internalTools } = this.tools
        for (const tool of Object.values(internalTools)) tool.cleanup()
        await this.writeMetadata({ scraperActive: false })
        emitter.emit('done')
        emitter.cleanup()
        logger.info(`Done.`)
      })

      await this.ensureSafeFolder()
      await this.initFolders()
      await this.writeMetadata({ scraperActive: true })
      for (const tool of Object.values(this.tools)) tool.initialize()

        throw new Error('me')
      const program = compileProgram(this.settings, this.tools)

      emitter.emit('initialized')
      logger.info('Starting scraper.')

      const subscription = program.subscribe({
        error: async (error: Error) => {
          await this.writeMetadata({ scraperActive: false })
          emitter.emit('error', error)
          logger.error(error)
          subscription.unsubscribe()
          for (const tool of Object.values(this.tools)) tool.cleanup()
        },
        complete: () => {
          const { emitter, ...internalTools } = this.tools
          for (const tool of Object.values(internalTools)) tool.cleanup()

          // TODO is this necessary anymore?
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
      for (const tool of Object.values(this.tools)) tool.cleanup()
    }
    return this
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

  public emit(event: string | symbol, ...args: any[]) {
    // ;(this.tools.emitter.emitter.emit as any)(event, ...args)
    this.tools.emitter.emitter.emit(event, ...args)
  }

  public on(event: string, listener: (...args: any[]) => void) {
    this.tools.emitter.emitter.on(event, listener)
    // this.tools.emitter.on(event, () => {
    //   console.log('IM IN THE MACHINE, CAN YOU HEAR ME?')
    // })
    // ;(this.tools.emitter.emitter.on as any)(event, listener)
    return this
  }
  public removeAllListeners() {
    this.tools.emitter.cleanup()
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
