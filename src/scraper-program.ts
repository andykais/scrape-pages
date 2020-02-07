interface Config {}
interface Options {}
interface Instructions {
  program: Config
  options: Options
}
class ScraperProgram {
  private instructions: Instructions
  public constructor(dslInput: string, options: Options)
  public constructor(configInput: {}, options: Options)
  public constructor(input: string | {}, options: Options) {
    // if its a string, compile it using the dsl-parser
    const configInit = typeof input === 'string' ? {} : input
    const marshalledInput = configInit // normaize the config here. Classify it?
    const compiledInstructions = marshalledInput // compile the rxjs program here
    this.instructions = {
      program: compiledInstructions,
      options
    }

  }
}

export { ScraperProgram }
