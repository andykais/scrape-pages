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
  public forEach: ParserEngine['forEach']
  private $: CheerioSelector
  public constructor(private command: I.ParseCommand, private cheerioFlags: {} = {}) {
    this.forEach = this.command.params.ATTR === undefined ? this.forEachText : this.forEachAttr
  }
  public load(html: string) {
    this.$ = cheerio.load(html, this.cheerioFlags)
  }
  private forEachText: ParserEngine['forEach'] = cb => {
    const { $ } = this
    const { SELECTOR } = this.command.params
    $(SELECTOR).each(function(i) {
      cb($(this).text(), i)
    })
  }
  private forEachAttr: ParserEngine['forEach'] = cb => {
    const { SELECTOR, ATTR } = this.command.params
    this.$(SELECTOR).attr(ATTR!, (index: any, attributeVal: any) => {
      if (attributeVal) cb(attributeVal, index)
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
        if (this.command.params.MAX === undefined || this.command.params.MAX > i) {
          const id = this.tools.store.qs.insertValue(this.commandId, payload, i, value)
          parsedResult.push(payload.merge({ value, valueIndex: i, id }))
        }
      })
    })()

    return Promise.resolve(parsedResult)
  }

  async cleanup() {}
}

export { ParseCommand }
