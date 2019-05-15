import { Parser as HtmlParser } from './html'
// type imports
import { ScrapeSettings } from '../../../../settings'
import { ScraperName, ParseConfigXml } from '../../../../settings/config/types'
import { Tools } from '../../../../tools'

export class Parser extends HtmlParser {
  public type: 'xml' = 'xml'

  public constructor(
    scraperName: ScraperName,
    parseConfig: ParseConfigXml,
    settings: ScrapeSettings,
    tools: Tools,
    cheerioFlags: {} = {}
  ) {
    super(scraperName, parseConfig, settings, tools)
    this.cheerioFlags = { xmlMode: true, ...cheerioFlags }
  }
}
