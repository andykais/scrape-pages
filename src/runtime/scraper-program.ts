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
}

export { ScraperProgram }
