import { Parser as HtmlParser } from './implementations/html'
import { Parser as XmlParser } from './implementations/xml'
import { Parser as JsonParser } from './implementations/json'
import { Parser as IdentityParser } from './implementations/identity'
// type imports
import { ScrapeSettings } from '../../../settings'
import { ScraperName, ParseConfigXml } from '../../../settings/config/types'
import { Tools } from '../../../tools'

export const parserClassFactory = (
  scraperName: ScraperName,
  settings: ScrapeSettings,
  tools: Tools
) => {
  const { parse } = settings.config
  const { format } = parse || { format: undefined }

  switch (format) {
    case 'html':
      return new HtmlParser(scraperName, parse! as ParseConfigXml, settings, tools)
    case 'xml':
      return new XmlParser(scraperName, parse! as ParseConfigXml, settings, tools)
    case 'json':
      return new JsonParser(scraperName, parse!, settings, tools)
    default:
      return new IdentityParser(scraperName, parse, settings, tools)
  }
}
export type ParserClass = HtmlParser | JsonParser | IdentityParser
