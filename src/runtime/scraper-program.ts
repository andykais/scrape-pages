import { EventEmitter } from 'events'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import * as RxCustom from '@scrape-pages/compiler/observables'
import { dslParser } from '@scrape-pages/dsl-parser'
import { Compiler } from '@scrape-pages/compiler'
import * as fs from '@scrape-pages/util/fs'
import * as tools from '@scrape-pages/runtime/tools'
import * as commands from '@scrape-pages/runtime/commands'
import { RuntimeBase } from './runtime-base'
import { typecheckInstructions } from '@scrape-pages/types/runtime-typechecking'
// type imports
import { Instructions, Command } from '@scrape-pages/types/instructions'
import { Options } from '@scrape-pages/types/options'
import { Settings, Querier, Tools, Stream } from '@scrape-pages/types/internal'

const ProgramState = {
  IDLE: 'IDLE' as const,
  ACTIVE: 'ACTIVE' as const,
  STOPPED: 'STOPPED' as const,
  COMPLETED: 'COMPLETED' as const,
  ERRORED: 'ERRORED' as const
}
type ProgramStateEnum = keyof typeof ProgramState

class ScraperProgramRuntime extends RuntimeBase {
  public tools: Tools
  public observables: Rx.Observable<any>
  private program: Stream.Observable
  public subscription: Stream.Subscriber
  private commands: commands.AnyCommand[]

  constructor(private settings: Settings, apiEmitter: EventEmitter) {
    super('ScraperProgramRuntime')

    const store = new tools.Store(settings)
    const queue = new tools.Queue(settings)
    const notify = new tools.Notify(apiEmitter)
    this.tools = { store, queue, notify }

    const compiler = new Compiler(settings, this.tools)
    const runtimes = compiler.compile()
    this.program = runtimes.program
    this.commands = runtimes.commands
    this.observables = RxCustom.any(queue.scheduler, this.program)
  }
  public async initialize() {
    for (const tool of Object.values(this.tools)) await tool.initialize()
    for (const command of this.commands) await command.initialize()
    super.initialize()
  }
  public cleanup() {
    if (this.subscription) this.subscription.unsubscribe()
    for (const command of this.commands) command.cleanup()
    for (const tool of Object.values(this.tools)) tool.cleanup()
  }
}

class ScraperProgram extends EventEmitter {
  private instructions: Instructions
  private program: Stream.Observable
  private fromExistingFolder: boolean
  private runtime: ScraperProgramRuntime
  private folder: string

  private state: ProgramStateEnum
  // we only track completes, if an error is emitted without anyone watching for it, we get an uncaught
  // exception. This is better
  private completed: boolean
  /**
   * @name query
   * @description query for tagged items in the database
   */
  public query: Querier.Interface

  public constructor(dslInstructions: string, folder: string, options?: Options)
  public constructor(objectInstructions: Instructions, folder: string, options?: Options)
  // prettier-ignore
  public constructor(instructionsArg: string | Instructions, folder: string, options: Options = {}) {
    super()
    // if its a string, compile it using the dsl-parser
    const instructions =
      typeof instructionsArg === 'string'
        ? dslParser(instructionsArg)
        : JSON.parse(JSON.stringify(instructionsArg))
    // TODO validate that tag & input slugs do not equal 'value', 'index', 'request'
    const settings: Settings = { instructions, folder, options }
    this.runtime = new ScraperProgramRuntime(settings, this)
    this.query = this.runtime.tools.store.query
    this.fromExistingFolder = false
    this.folder = folder
    this.state = ProgramState.IDLE

    this.on('stop', this.stop)
    this.on('useRateLimiter', this.toggleRateLimiter)
    this.on('done', () => (this.completed = true))
  }

  /**
   * @name start
   * @description begin scraping and write results to disk
   */
  public start() {
    this.setState(ProgramState.ACTIVE)
    // setImmediate(() => {
      this._start()
    // })
    return this
  }

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
    this.setState(ProgramState.STOPPED)
  }
  public stopCommand(label: string) {
    this.runtime.mustBeInitialized()
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
    if (this.state === ProgramState.COMPLETED) return Promise.resolve()
    if (this.state === ProgramState.STOPPED) return Promise.resolve()
    return new Promise((resolve, reject) => {
      const onDone = () => {
        resolve()
        this.removeListener('done', onDone)
      }
      const onError = (e: Error) => {
        reject(e)
        this.removeListener('error', onError)
      }
      this.on('done', onDone)
      this.on('error', onError)
    })
  }

  private async _start() {
    // TODO make function synchronous and return `this` so we can do scraper.start().toPromise()
    // TODO only let start be called once? Maybe? Maybe we can reuse a class?
    try {
      await fs.mkdirp(this.folder)
      await this.runtime.initialize()
      this.runtime.subscription = this.runtime.observables.subscribe({
        error: async (error: Error) => {
          this.emit('error', error)
          this.setState(ProgramState.ERRORED)
          await this.runtime.cleanup()
        },
        complete: async () => {
          this.emit('done')
          this.setState(ProgramState.COMPLETED)
          await this.runtime.cleanup()
        }
      })
      this.runtime.tools.notify.initialized()
    } catch (error) {
      this.emit('error', error)
      await this.setState(ProgramState.ERRORED)
      await this.runtime.cleanup()
    }
  }

  private async initFolder() {
    // await fs.mkdirp
  }
  private setState(state: ProgramStateEnum) {
    // TODO write state from here and here only
    this.state = state
  }
}

export { ScraperProgram, ProgramStateEnum }
