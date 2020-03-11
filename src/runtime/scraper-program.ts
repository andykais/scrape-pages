import { EventEmitter } from 'events'
import { dslParser } from '@scrape-pages/dsl-parser'
import { Compiler } from '@scrape-pages/compiler'
import * as fs from '@scrape-pages/util/fs'
import * as tools from '@scrape-pages/runtime/tools'
import * as commands from '@scrape-pages/runtime/commands'
import { RuntimeBase } from './runtime-base'
// type imports
import { Instructions } from '@scrape-pages/types/instructions'
import { Options } from '@scrape-pages/types/options'
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'

class ScraperProgramRuntime extends RuntimeBase {
  public tools: Tools
  public program: Stream.Observable
  public subscription: Stream.Subscriber
  private commands: commands.BaseCommand[]

  constructor(private settings: Settings, apiEmitter: EventEmitter) {
    super('ScraperProgramRuntime')

    const store = new tools.Store()
    const queue = new tools.Queue()
    const notify = new tools.Notify(apiEmitter)

    const compiler = new Compiler(settings)
    const runtimes = compiler.compile()
    this.tools = { store, queue, notify }
    this.program = runtimes.program
    this.commands = runtimes.commands
  }
  public async initialize() {
    for (const command of this.commands) await command.initialize()
    for (const tool of Object.values(this.tools)) await tool.initialize()
  }
  public async cleanup() {
    if (this.subscription) this.subscription.unsubscribe()
    for (const command of this.commands) await command.cleanup()
    for (const tool of Object.values(this.tools)) await tool.cleanup()
  }
}

class ScraperProgram extends EventEmitter {
  private instructions: Instructions
  private program: Stream.Observable
  private fromExistingFolder: boolean
  private runtime: ScraperProgramRuntime

  public constructor(dslInput: string, options: Options)
  public constructor(instructions: Instructions, options: Options)
  public constructor(input: string | Instructions, options: Options) {
    super()
    // if its a string, compile it using the dsl-parser
    const instructions = typeof input === 'string' ? dslParser(input) : input
    // TODO validate that tag & input slugs do not equal 'value', 'index', 'request'
    const settings: Settings = { instructions, options }
    this.runtime = new ScraperProgramRuntime(settings, this)
    this.fromExistingFolder = false

    this.on('stop', this.stop)
    this.on('useRateLimiter', this.toggleRateLimiter)
  }

  /**
   * @name start
   * @description begin scraping and write results to disk
   */
  public async start(folder: string) {
    // TODO only let start be called once? Maybe? Maybe we can reuse a class?
    try {
      await fs.mkdirp(folder)
      await this.writeMetadata({ state: 'ACTIVE' })
      await this.runtime.initialize()
      this.runtime.subscription = this.runtime.program.subscribe({
        error: async (error: Error) => {
          this.emit('error', error)
          await this.writeMetadata({ state: 'ERRORED' })
          await this.runtime.cleanup()
        },
        complete: async () => {
          this.emit('done')
          await this.writeMetadata({ state: 'COMPLETED' })
          await this.runtime.cleanup()
        }
      })
      this.runtime.tools.notify.initialized()
    } catch (error) {
      this.emit('error', error)
      await this.writeMetadata({ state: 'ERRORED' })
      await this.runtime.cleanup()
    }
  }

  /**
   * @name query
   * @description query for tagged items in the database
   */
  // TODO perhaps we will add back in a standalone query grabber
  public async query(tags: string[], options: { groupBy?: string } = {}) {}

  /**
   * @name onAny
   * @description listen for any event
   */
  public async onAny(listener: (event: string, data: any) => void) {
    this.runtime.tools.notify.registerOnAny(listener)
  }

  public stop = () => {
    this.runtime.mustBeInitialized()
    // lets double check that this is all it takes. We may need some state in there when observables fall short
    this.runtime.cleanup()
  }
  public stopCommand(label: string) {
    this.runtime.mustBeInitialized()
    // TODO we dont have a good way to do this (maybe a LABEL field on all commands?)
    throw new Error('unimplemented')
  }
  public toggleRateLimiter(toggle: boolean) {
    this.runtime.mustBeInitialized()
  }

  /**
   * @name toPromise
   * @description convienience method returns a promise that resolves on the 'done' event
   */
  public toPromise(): Promise<void> {
    return Promise.resolve()
  }

  private async initFolder() {
    // await fs.mkdirp
  }
  private async writeMetadata({ state }: { state: 'ACTIVE' | 'COMPLETED' | 'ERRORED' }) {}
}

export { ScraperProgram }
