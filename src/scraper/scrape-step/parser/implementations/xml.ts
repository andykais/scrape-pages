import { Parser as HtmlParser } from './html'
// type imports
import { ScrapeSettings } from '../../../../settings'
import { ParseConfigInterface, ParseConfigXml } from '../../../../settings/config/types'
import { Tools } from '../../../../tools'

export class Parser extends HtmlParser {
  public type: 'xml' = 'xml'

  public constructor(
    parseConfig: ParseConfigXml,
    settings: ScrapeSettings,
    tools: Tools,
    cheerioFlags: {} = {}
  ) {
    super(parseConfig, settings, tools)
    this.cheerioFlags = { xmlMode: true, ...cheerioFlags }
  }

  public static isXmlParseConfig = (
    parseConfig: ParseConfigInterface
  ): parseConfig is ParseConfigXml => (parseConfig as ParseConfigXml).format === 'xml'
}
