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
  private tools: Tools
  private program: Stream.Observable
  private commands: commands.BaseCommand[]
  constructor(private settings: Settings, apiEmitter: EventEmitter) {
    super('ScraperProgramRuntime')

    const store = new tools.Store()
    const queue = new tools.Queue()


    const compiler = new Compiler(settings)
    const runtimes = compiler.compile()
    this.tools = { store, queue }
    this.program = runtimes.program
    this.commands = runtimes.commands
  }
  public async initialize() {
    for (const command of this.commands) await command.initialize()
    for (const tool of Object.values(this.tools)) await tool.initialize()
  }
  public async cleanup() {
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

    // Events:
    //
    // initialized
    // done
    // error
    //
    // request:queued
    // request:progress
    // request:completed
    //
    // <tag>:saved
  }

  /**
   * @name start
   * @description begin scraping and write results to disk
   */
  public async start(folder: string) {
    await fs.mkdirp(folder)
    await this.writeMetadata({ state: 'ACTIVE' })
    this.runtime.initialize()
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
  public async onAny(listener: (event: string, data: any) => void) {}

  public stop = () => {
    this.runtime.mustBeInitialized()
  }
  public stopCommand(label: string) {
    this.runtime.mustBeInitialized()
    // TODO we dont have a good way to do this (maybe a LABEL field on all commands?)
    throw new Error('unimplemented')
  }
  public toggleRateLimiter(toggle: boolean) {
    this.runtime.mustBeInitialized()
  }

  public getTags() {
    // return this.instructionsAnalysis.tags
  }

  /**
   * @name toPromise
   * @description convienience method returns a promise that resolves on the 'done' event
   */
  public toPromise(): Promise<void> {
    return Promise.resolve()
  }

  /**
   * @name fromFolder
   * @description reuse an existing scraper folder
   */
  public static fromFolder(folder: string, options?: Options) {
    // check if the metadata of the scraper in that folder is COMPLETED. If not, we cannot start
    // const scraper = new ScraperProgram('', {})
    // scraper.fromExistingFolder = true
    // TODO we should only reuse scraper folders if the instructions are the same. Debugging changed state is
    // a nightmare. Changing options is ok though
    //
    // this might also make it worth separating the instructions options from the runner options.
    // E.g. its ok to override the rateLimit or the input but its not good to override the folder or cleanFolder
    // return new ScraperProgram()
  }

  private async initFolder() {
    // await fs.mkdirp
  }
  private async writeMetadata({ state }: { state: 'ACTIVE' | 'COMPLETED' | 'ERRORED' }) {}
}

export { ScraperProgram }
