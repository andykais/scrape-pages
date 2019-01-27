import { Parser as HtmlParser } from './implementations/html'
import { Parser as JsonParser } from './implementations/json'
import { Parser as IdentityParser } from './implementations/identity'
// type imports
import { ScraperName, ScrapeConfig } from '../../../settings/config/types'
import { Options } from '../../../settings/options/types'
import { Tools } from '../../../tools'

const parsers = {
  html: HtmlParser,
  json: JsonParser
}
export const parserClassFactory = (
  scraperName: ScraperName,
  config: ScrapeConfig,
  options: Options,
  tools: Tools
) => {
  // TODO use type guards
  if (config.parse) {
    return new parsers[config.parse.expect](scraperName, config, options, tools)
  } else {
    return new IdentityParser(scraperName, config, options, tools)
  }
}
export type ParserClass = HtmlParser | JsonParser | IdentityParser
