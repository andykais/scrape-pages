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
import { Options, RateLimit } from '@scrape-pages/types/options'
import { RuntimeState, Settings, Querier, Tools, Stream } from '@scrape-pages/types/internal'

class ScraperProgramRuntime extends RuntimeBase {
  public tools: Tools
  public commands: commands.AnyCommand[]
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
    this.tools.notify.initialized()
    this.subscription = this.observables.subscribe({
      error: async (error: Error) => {
        if (error instanceof errors.ExpectedException) return
        this.error(error)
      },
      complete: this.complete
    })
  }

  protected async onStop(prevState: RuntimeState) {
    // only the commands need to stop. We cancel anything in flight, and close them off from new values
    // then the observables simply drain. If there are no unexpected errors, the onComplete handles the rest
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

/**
 * Scraper class
 */
class ScraperProgram extends EventEmitter {
  private runtime: ScraperProgramRuntime
  private folder: string

  /**
   * @param dslInstructions - scraper instructions using the DSL
   * @param folder - where the database & downloaded files will be stored
   * @param options - command specific defaults and behavior options
   */
  // prettier-ignore
  public constructor(dslInstructions: string, folder: string, options?: Options)
  /**
   * @param objectInstructions - scraper instructions using structured json
   * @param folder - where the database & downloaded files will be stored
   * @param options - command specific defaults and behavior options
   */
  // prettier-ignore
  public constructor(objectInstructions: Instructions, folder: string, options?: Options)
  // prettier-ignore
  public constructor(instructionsArg: string | Instructions, folder: string, options: Options = {}) {
    super()
    // if its a string, compile it using the dsl-parser
    const instructions = typeof instructionsArg === 'string' ? dslParser(instructionsArg) : instructionsArg
    const settings: Settings = { instructions, folder, options }
    this.runtime = new ScraperProgramRuntime(settings, this)

    this.query = this.runtime.tools.store.query
    this.folder = folder
  }

  /**
   * Query for tagged items in the database
   */
  public query: Querier.Interface

  /**
   * Begin scraping and write results to disk
   */
  public start() {
    this.runtime.start()
    return this
  }

  /**
   * Stop the scraper at any point
   */
  public stop() {
    this.runtime.stop()
  }

  /**
   * Change the current rate limit settings. They go into affect immediately
   *
   * @param rateLimit - the updated throttle and max concurrency settings, same that options FETCH takes
   */
  public updateRateLimit(rateLimit: RateLimit) {
    this.runtime.tools.queue.updateRateLimit(rateLimit)
  }

  /**
   * Stop a specific command by label
   *
   * @param label - label of the command to stop
   */
  public stopCommand(label: string) {
    const command = this.runtime.commands.find(command => command.LABEL === label)
    if (command) {
      command.stop()
    }
  }

  /**
   * Listen for any event
   *
   * @param listener - event listener callback
   */
  public async onAny(listener: (event: string, data: any) => void) {
    this.runtime.tools.notify.registerOnAny(listener)
  }

  /**
   * Convienience method returns a promise that resolves on the 'done' event
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
