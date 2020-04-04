import cheerio from 'cheerio'
import { BaseCommand } from './base-command'
// type imports
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'
import * as I from '@scrape-pages/types/instructions'

interface ParserEngine {
  load(input: string): void
  forEach(cb: (value: string, index: number) => void): void
}

class CheerioParser implements ParserEngine {
  private $: CheerioSelector
  public constructor(private command: I.ParseCommand, private cheerioFlags: {} = {}) {}

  public load(html: string) {
    this.$ = cheerio.load(html, this.cheerioFlags)
  }
  public forEach: ParserEngine['forEach'] = cb => {
    const { $ } = this
    const { SELECTOR, ATTR, MAX } = this.command.params
    // we could also set up an generator here, depending on what is better for jsonata parser
    $(SELECTOR).each(function(i) {
      if (MAX !== undefined && i > MAX) return false // this stops cheerio each iteration
      const node = $(this)
      if (ATTR === undefined) cb(node.text(), i)
      else cb(node.attr(ATTR) || '', i) // this is a design decision. We assume you want to know when a selector didnt have an attribute you wanted
    })
  }
}

class JsonataParser implements ParserEngine {
  constructor(private command: I.ParseCommand) {}
  load(json: string) {
    throw new Error('unimplemented')
  }
  forEach(cb: (value: string, index: number) => void) {
    throw new Error('unimplemented')
  }
}

class ParseCommand extends BaseCommand<I.ParseCommand, typeof ParseCommand.PARAM_DEFAULTS> {
  private static PARAM_DEFAULTS = {
    FORMAT: 'html' as 'html',
    ATTR: undefined,
    MAX: undefined
  }
  private parserEngine: ParserEngine

  constructor(settings: Settings, tools: Tools, command: I.ParseCommand) {
    super(settings, tools, command, ParseCommand.PARAM_DEFAULTS)
    switch (this.params.FORMAT) {
      case 'html':
        this.parserEngine = new CheerioParser(this.command)
        break
      case 'xml':
        this.parserEngine = new CheerioParser(this.command, { xmlMode: true })
        break
      case 'json':
        this.parserEngine = new JsonataParser(this.command)
        break
      default:
        throw new Error(`Unsupported format type '${this.params.FORMAT}'`)
    }
  }

  stream(payload: Stream.Payload) {
    const parsedResult: Stream.Payload[] = []

    this.parserEngine.load(payload.value)

    this.tools.store.transaction(() => {
      this.parserEngine.forEach((value, i) => {
        const newPayload = this.saveValue(payload, i, value)
        parsedResult.push(newPayload)
      })
    })()

    return Promise.resolve(parsedResult)
  }

  async cleanup() {}
}

export { ParseCommand }
