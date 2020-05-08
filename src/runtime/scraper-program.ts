import { EventEmitter } from 'events'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import * as RxCustom from '@scrape-pages/compiler/observables'
import * as errors from '@scrape-pages/util/error'
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
import { RuntimeState, Settings, Querier, Tools, Stream } from '@scrape-pages/types/internal'

class ScraperProgramRuntime extends RuntimeBase {
  public tools: Tools
  private commands: commands.AnyCommand[]
  public observables: Rx.Observable<any>
  public subscription: Stream.Subscriber

  public constructor(private settings: Settings, private apiEmitter: EventEmitter) {
    super('ScraperProgramRuntime')
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
    for (const tool of Object.values(this.tools)) await tool.start()
    for (const command of this.commands) await command.start()
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
    for (const command of this.commands) command.stop()
  }

  protected async onError(prevState: RuntimeState, error: Error) {
    if (this.tools.store.state === RuntimeState.ACTIVE) {
      this.tools.store.qs.updateProgramState(RuntimeState.ERRORED)
    }
    // for (const tool of Object.values(this.tools)) tool.error()
    this.apiEmitter.emit('error', error)
  }

  protected async onComplete(prevState: RuntimeState) {
    // this.tools.store.qs.updateProgramState(RuntimeState.COMPLETED)
    for (const tool of Object.values(this.tools)) tool.complete()
    for (const command of this.commands) command.complete()
    this.apiEmitter.emit('done')
  }
}

class ScraperProgram extends EventEmitter {
  private runtime: ScraperProgramRuntime
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
    this.runtime = new ScraperProgramRuntime(settings, this)

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
    return this
  }

  /**
   * @name stop
   * @description stop the scraper at any point
   */
  public stop() {
    this.runtime.stop()
  }

  /**
   * @name toggleRateLimiter
   * @description toggle the rate limiter on fetch commands
   */
  public toggleRateLimiter(toggle: boolean) {
    throw new Error('unimplemented')
  }

  /**
   * @name stopCommand
   * @description stop a specific command by label
   * @param label label of the command to stop
   */
  public stopCommand(label: string) {
    throw new Error('unimplemented')
  }

  /**
   * @name onAny
   * @description listen for any event
   * @param listener event listener callback
   */
  public async onAny(listener: (event: string, data: any) => void) {
    this.runtime.tools.notify.registerOnAny(listener)
  }

  /**
   * @name toPromise
   * @description convienience method returns a promise that resolves on the 'done' event
   */
  public toPromise(): Promise<void> {
    if (this.runtime.state === RuntimeState.COMPLETED) return Promise.resolve()
    return new Promise((resolve, reject) => {
      this.once('done', resolve)
      this.once('error', reject)
    })
  }
}
export { ScraperProgram }
