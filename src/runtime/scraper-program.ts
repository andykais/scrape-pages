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
  INITIALIZING: 'INITIALIZING' as const,
  ACTIVE: 'ACTIVE' as const,
  STOPPING: 'STOPPING' as const,
  COMPLETED: 'COMPLETED' as const,
  ERRORED: 'ERRORED' as const
}
type ProgramStateEnum = keyof typeof ProgramState

class ScraperProgramRuntime extends RuntimeBase {
  public tools: Tools
  public observables: Rx.Observable<any>
  private program: Stream.Observable
  public scheduler: Stream.Subscriber
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
    // this.observables = Rx.merge(queue.scheduler, this.program.pipe(ops.takeUntil(Rx.fromEvent(apiEmitter, '_stop'))))
    this.observables = RxCustom.any(queue.scheduler, this.program)
  }
  public async initialize() {
    for (const tool of Object.values(this.tools)) await tool.initialize()
    for (const command of this.commands) await command.initialize()
    super.initialize()
  }
  public async initialize_v2(observer: Rx.ErrorObserver<any> & Rx.CompletionObserver<any>) {
    // public async initialize_v2(onError: Rx.ErrorObserver<any>, onComplete: Rx.CompletionObserver<any>) {
    for (const tool of Object.values(this.tools)) await tool.initialize()
    for (const command of this.commands) await command.initialize()
    this.scheduler = this.tools.queue.scheduler.subscribe({
      error: observer.error
      // complete: observer.complete
    })
    // this.scheduler = this.tools.queue.scheduler.subscribe({error(e) {
    //   if (e.name === 'AbortError') {

    //   } else {
    //     onError()
    //   }
    //   // complete
    // }})
    // his.subscription = this.observables.
    // super.initialize()
  }
  public cleanup() {
    console.log('command.cleanup')
    // this.tools.queue.scheduler.subscribe({
    //   error(e) {
    //     console.log('error for queue')
    //     console.log(e.name)
    //   }
    // })
    // TODO do NOT unsubscribe from the observable. Instead, when a stop command is initiated, clamp down that
    // command. Now any incoming values will immediately raise a ExpectedCancellationError. Aborted fetches
    // will do the same.
    // This is probably no longer necessary:
    // for (const command of this.commands) command.cleanup()
    // console.log('subscription.unsubscribe')
    // this.tools.notify.emit('_stop')
    // if (this.subscription) this.subscription.unsubscribe()
    for (const tool of Object.values(this.tools)) tool.cleanup()
  }

  public stop() {
    for (const command of this.commands) command.cleanup()
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
    this.setState(ProgramState.INITIALIZING)
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
    // TODO I think this conditional goes away now that we clamp commands on stop
    if (this.state === ProgramState.ACTIVE) {
      this.setState(ProgramState.STOPPING)
      this.runtime.stop()
      // this.runtime.cleanup()
    } else if (this.state === ProgramState.INITIALIZING) {
      this.setState(ProgramState.STOPPING)
      this.runtime.stop()
      this.once('initialized', () => {
        this.runtime.stop()
        // this.runtime.cleanup()
        this.emit('done')
      })
    } else {
      throw new Error(`Cannot stop scraper while it is in the ${this.state} state.`)
    }
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
    return new Promise((resolve, reject) => {
      this.once('done', resolve)
      this.once('error', reject)
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
          // if (error.name === 'ExpectedException') return
          // if (error.name === 'AbortError') return
          console.log('I found an error')
          this.emit('error', error)
          this.setState(ProgramState.ERRORED)
          await this.runtime.cleanup()
        },
        complete: async () => {
          console.log('COMPLETE')
          this.emit('done')
          this.setState(ProgramState.COMPLETED)
          await this.runtime.cleanup()
          console.log('observable complete')
        }
      })
      this.runtime.tools.notify.initialized()
      this.setState(ProgramState.ACTIVE)
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

// === V2 ===
import * as errors from '@scrape-pages/util/error'
import { RuntimeState } from '@scrape-pages/types/internal'
import { RuntimeBase_v2 } from '@scrape-pages/runtime/runtime-base'

class ScraperProgramRuntime_v2 extends RuntimeBase_v2 {
  public tools: Tools
  private commands: commands.AnyCommand[]
  public observables: Rx.Observable<any>
  // private program: Stream.Observable
  // public scheduler: Stream.Subscriber
  public subscription: Stream.Subscriber

  public constructor(private settings: Settings, private apiEmitter: EventEmitter) {
    super(apiEmitter)
    const store = new tools.Store(settings)
    const queue = new tools.Queue(settings)
    const notify = new tools.Notify(apiEmitter)
    this.tools = { store, queue, notify }

    const compiler = new Compiler(settings, this.tools)
    const runtimes = compiler.compile()
    const program = runtimes.program
    this.commands = runtimes.commands
    this.observables = RxCustom.any(queue.scheduler, program)
  }

  protected async onStart(prevState: RuntimeState) {
    await fs.mkdirp(this.settings.folder)
    for (const tool of Object.values(this.tools)) await tool.initialize()
    for (const command of this.commands) await command.initialize()
    this.subscription = this.observables.subscribe({
      error: async (error: Error) => {
        if (error instanceof errors.ExpectedException) return
        this.error(error)
      },
      complete: this.complete
    })
    this.tools.notify.initialized()
  }

  protected async onStop(prevState: RuntimeState) {
    // only the commands need to stop. We cancel anything in flight, and close them off from new values
    // then the observables simply drain. If there are no errors, the onComplete handles the rest
    for (const command of this.commands) command.cleanup()
  }

  protected async onError(prevState: RuntimeState, error: Error) {
    this.tools.store.qs.updateProgramState(RuntimeState.ERRORED)
    // for (const tool of Object.values(this.tools)) tool.error()
    this.apiEmitter.emit('error', error)
  }

  protected onComplete = async (prevState: RuntimeState) => {
    this.tools.store.qs.updateProgramState(RuntimeState.COMPLETED)
    // for (const tool of Object.values(this.tools)) tool.complete()
    this.apiEmitter.emit('done')
  }
}

class ScraperProgram_v2 extends EventEmitter {
  private runtime: ScraperProgramRuntime_v2
  // private program: Stream.Observable
  private folder: string

  // prettier-ignore
  public constructor(dslInstructions: string, folder: string, options?: Options)
  // prettier-ignore
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
    this.runtime = new ScraperProgramRuntime_v2(settings, this)

    this.query = this.runtime.tools.store.query
    this.folder = folder

    this.on('stop', this.stop)
    this.on('useRateLimiter', this.toggleRateLimiter)
  }

  /**
   * @name query
   * @description query for tagged items in the database
   */
  public query: Querier.Interface

  /**
   * @name start
   * @description begin scraping and write results to disk
   */
  public start() {
    this.runtime.start()
  }

  /**
   * @name stop
   * @description stop the scraper at any point
   */
  public stop() {
    this.runtime.stop()
  }

  public toggleRateLimiter(toggle: boolean) {
    throw new Error('unimplemented')
  }
  public stopCommand(label: string) {
    throw new Error('unimplemented')
  }

  /**
   * @name onAny
   * @description listen for any event
   */
  public async onAny(listener: (event: string, data: any) => void) {
    this.runtime.tools.notify.registerOnAny(listener)
  }

  /**
   * @name toPromise
   * @description convienience method returns a promise that resolves on the 'done' event
   */
  public toPromise(): Promise<void> {
    if (this.runtime.state === ProgramState.COMPLETED) return Promise.resolve()
    return new Promise((resolve, reject) => {
      this.once('done', resolve)
      this.once('error', reject)
    })
  }
}
