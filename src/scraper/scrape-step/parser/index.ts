import { Parser as HtmlParser } from './implementations/html'
import { Parser as XmlParser } from './implementations/xml'
import { Parser as JsonParser } from './implementations/json'
import { Parser as IdentityParser } from './implementations/identity'
// type imports
import { ScrapeSettings } from '../../../settings'
import { Tools } from '../../../tools'

export const parserClassFactory = (settings: ScrapeSettings, tools: Tools) => {
  const { parse } = settings.config

  if (!parse) {
    return new IdentityParser(parse, settings, tools)
  } else if (HtmlParser.isHtmlParseConfig(parse)) {
    return new HtmlParser(parse, settings, tools)
  } else if (XmlParser.isXmlParseConfig(parse)) {
    return new XmlParser(parse, settings, tools)
  } else if (JsonParser.isJsonParseConfig(parse)) {
    return new JsonParser(parse, settings, tools)
  }
}
export type ParserClass = HtmlParser | JsonParser | IdentityParser
