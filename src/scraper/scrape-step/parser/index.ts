import { Parser as HtmlParser } from './implementations/html'
import { Parser as JsonParser } from './implementations/json'
import { Parser as IdentityParser } from './implementations/identity'
// type imports
import { ScrapeSettings } from '../../../settings'
import { ScraperName } from '../../../settings/config/types'
import { Tools } from '../../../tools'

const parsers = {
  html: HtmlParser,
  json: JsonParser
}
export const parserClassFactory = (
  scraperName: ScraperName,
  settings: ScrapeSettings,
  tools: Tools
) => {
  const { parse } = settings.config
  // TODO use type guards
  if (parse) {
    return new parsers[parse.expect](scraperName, parse, settings, tools)
  } else {
    return new IdentityParser(scraperName, parse, settings, tools)
  }
}
export type ParserClass = HtmlParser | JsonParser | IdentityParser
