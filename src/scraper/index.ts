import * as path from 'path'
import { initTools } from '../tools'
import { mkdirp, rmrf, exists, read, writeFile } from '../util/fs'
import { ActiveScraperLockError, MismatchedVersionError } from '../util/errors'
import { getSettings } from '../settings'
import { Logger } from '../tools/logger'
import { Store } from '../tools/store'
import { compileProgram } from './flow'
// type imports
import * as Rx from 'rxjs'
import { Tools } from '../tools'
import { ToolBase } from '../tools/abstract'
import { QueryFn } from '../tools/store/querier-entrypoint'
import { Settings } from '../settings'
import { ConfigInit } from '../settings/config/types'
import { OptionsInit } from '../settings/options/types'
import { ParamsInit } from '../settings/params/types'

export class ScraperProgram extends ToolBase {
  public query: QueryFn
  protected settings: Settings
  private tools: Tools
  private programSubscription: Rx.Subscription

  /**
   * Instantiate a scraper
   *
   * @param configInit 'what' is going to be scraped (the actual urls and parse strings)
   * @param optionsInit 'how' is the site going to be scraped (mostly how downloads should behave)
   * @param paramsInit 'who' is going to be scraped (settings specific to each run)
   */
  public constructor(configInit: ConfigInit, optionsInit: OptionsInit, paramsInit: ParamsInit) {
    super(getSettings(configInit, optionsInit, paramsInit))
    this.query = Store.querierFactory(this.settings)
    this.tools = initTools(this.settings)
  }

  /**
   * Start the scraper. This function initializes the scraper program and kicks it off. You cannot call the
   * other methods on this class until start() has completed.
   */
  public start = async () => {
    // TODO add a scraperActive stateful var. If start is called when that value is true, then throw an error
    try {
      await this.ensureSafeFolder()
      await this.initFolders()
      await this.writeMetadata({ scraperActive: true })

      for (const tool of Object.values(this.tools)) tool.initialize()

      const program = compileProgram(this.settings, this.tools)

      this.tools.emitter.emit('initialized')
      this.tools.logger.info('Starting scraper.')
      this.initialize()

      this.programSubscription = program.subscribe({
        error: async (error: Error) => {
          await this.cleanup(error)
        },
        complete: () => {
          // TODO is this necessary anymore?
          // a nicety so we can await "initialized" and then start listening for "done"
          setTimeout(async () => {
            this.tools.logger.info('Program completed successfully.')
            await this.cleanup()
          }, 0)
        }
      })
    } catch (error) {
      this.cleanup(error)
    }
  }

  public stop = () => {
    // TODO add abort controller to node-fetch (see https://github.com/node-fetch/node-fetch#request-cancellation-with-abortsignal)
    this.throwIfUninitialized()
    this.tools.logger.info('Exiting manually.')
    this.tools.emitter.emitter.emit('stop')
    this.cleanup()
  }
  public stopScraper = (scraperName: string) => {
    this.throwIfUninitialized()
    this.tools.emitter.emitter.emit(`stop:${scraperName}`)
  }
  public useRateLimiter = (toggle: boolean) => {
    this.throwIfUninitialized()
    this.tools.emitter.emitter.emit('useRateLimiter', toggle)
  }
  public on(event: string, listener: (...args: any[]) => void) {
    this.tools.emitter.emitter.on(event, listener)
    return this
  }
  public onAny(listener: (event: string, ...args: any[]) => void) {
    this.tools.emitter.emitter.onAny(listener)
    return this
  }

  public getCompletionPromise = () => {
    // TODO handle the case where it completed before this method was called
    // E.g. add state to the emitter events somewhere
    return new Promise((resolve, reject) => this.on('done', resolve).on('error', reject))
  }

  protected async cleanup(error?: Error) {
    try {
      if (error) {
        this.tools.emitter.emit('error', error)
        if (this.tools.logger.isInitialized) this.tools.logger.error(error)
      }
      if (this.programSubscription) this.programSubscription.unsubscribe()
      await this.writeMetadata({ scraperActive: false })
      this.tools.queue.cleanup()
      this.tools.store.cleanup()
      if (!error) {
        this.tools.emitter.emit('done')
        this.tools.logger.info(`Done.`)
      }
      this.tools.emitter.cleanup()
      this.tools.logger.cleanup()
    } catch (error) {
      this.tools.emitter.emit('error', error)
      this.tools.logger.error(error)
    }
  }
  private communicationCleanup() {
    this.tools.emitter.cleanup()
    this.tools.logger.cleanup()
  }

  /** internal */
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

  /** internal */
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

  /** internal */
  private async writeMetadata({ scraperActive }: { scraperActive: boolean }) {
    const metadataFile = path.resolve(this.settings.paramsInit.folder, 'metadata.json')
    const metadata = {
      scraperActive,
      version: process.env.PACKAGE_VERSION,
      settingsInit: {
        configInit: this.settings.configInit,
        optionsInit: this.settings.optionsInit,
        paramsInit: this.settings.paramsInit
      }
    }

    await writeFile(metadataFile, JSON.stringify(metadata))
  }
}
