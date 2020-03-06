import { dslParser } from 'scrape-pages/dsl-parser'
import { Compiler } from 'scrape-pages/compiler'
// type imports
import { Instructions } from 'scrape-pages/types/instructions'
import { Options } from 'scrape-pages/types/options'
import { Settings, Tools } from 'scrape-pages/types/internal'

class ScraperProgram {
  private instructions: Instructions
  public constructor(dslInput: string, options: Options)
  public constructor(instructions: Instructions, options: Options)
  public constructor(input: string | Instructions, options: Options) {
    // if its a string, compile it using the dsl-parser
    const instructions = typeof input === 'string' ? dslParser(input) : input
    const settings: Settings = { instructions, options }
    const tools = {} // TODO
    const compiler = new Compiler(settings, tools)
    const program = compiler.compile()
  }

  static fromFolder(folder: string, options?: Options) {
    // TODO we should only reuse scraper folders if the instructions are the same. Debugging changed state is
    // a nightmare. Changing options is ok though
    //
    // this might also make it worth separating the instructions options from the runner options.
    // E.g. its ok to override the rateLimit or the input but its not good to override the folder or cleanFolder
    // return new ScraperProgram()
  }
}

export { ScraperProgram }
