import cheerio from 'cheerio'
import jsonata from 'jsonata'
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
  public forEach: ParserEngine['forEach'] = (cb) => {
    const { $ } = this
    const { SELECTOR, ATTR, MAX } = this.command.params
    // we could also set up an generator here, depending on what is better for jsonata parser
    $(SELECTOR).each(function (i) {
      if (MAX !== undefined && i > MAX) return false // this stops cheerio each iteration
      const node = $(this)
      if (ATTR === undefined) cb(node.text(), i)
      else cb(node.attr(ATTR) || '', i) // this is a design decision. We assume you want to know when a selector didnt have an attribute you wanted
    })
  }
}

class JsonataParser implements ParserEngine {
  private parser: jsonata.Expression
  private object: object

  public constructor(private command: I.ParseCommand) {
    this.parser = jsonata(this.command.params.SELECTOR)
  }
  public load(json: string) {
    this.object = JSON.parse(json)
  }
  public forEach(cb: (value: string, index: number) => void) {
    const result = this.parser.evaluate(this.object)
    const resultArray = Array.isArray(result) ? result : [result]
    for (const [i, result] of resultArray.entries()) {
      if (typeof result === 'object') cb(JSON.stringify(result), i)
      else if (typeof result === 'undefined') cb('', i)
      else cb(result.toString(), i)
    }
  }
}

class DelimiterParser implements ParserEngine {
  private regex: RegExp
  private text: string

  public constructor(private command: I.ParseCommand) {
    this.regex = new RegExp(command.params.SELECTOR)
  }

  public load(text: string) {
    this.text = text
  }

  public forEach: ParserEngine['forEach'] = (cb) => {
    this.text.split(this.regex).forEach((value, i) => cb(value, i))
  }
}

class ParseCommand extends BaseCommand<I.ParseCommand, typeof ParseCommand.DEFAULT_PARAMS> {
  public static DEFAULT_PARAMS = {
    FORMAT: 'html' as NonNullable<I.ParseCommand['params']['FORMAT']>,
    ATTR: undefined,
    MAX: undefined,
    TRIM: false,
  }
  private parserEngine: ParserEngine

  public constructor(settings: Settings, tools: Tools, command: I.ParseCommand) {
    super(settings, tools, command, ParseCommand.DEFAULT_PARAMS, 'PARSE')
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
      case 'delimiter':
        this.parserEngine = new DelimiterParser(this.command)
        break
      default:
        throw new Error(`Unsupported format type '${this.params.FORMAT}'`)
    }
  }

  public stream(payload: Stream.Payload) {
    const parsedResult: Stream.Payload[] = []

    const preProcessedValue = this.params.TRIM ? payload.value.trim() : payload.value
    this.parserEngine.load(preProcessedValue)

    this.tools.store.transaction(() => {
      this.parserEngine.forEach((value, i) => {
        const processedValue = this.params.TRIM ? value.trim() : value
        const newPayload = this.saveValue(payload, i, processedValue)
        parsedResult.push(newPayload)
      })
    })()

    return Promise.resolve(parsedResult)
  }
}

export { ParseCommand }
