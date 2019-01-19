import { Parser as HtmlParser } from './implementations/html'
import { Parser as JsonParser } from './implementations/json'
import { Parser as IdentityParser } from './implementations/identity'
// type imports
import { ScrapeConfig } from '../../../settings/config/types'
import { Options } from '../../../settings/options/types'
import { Tools } from '../../../tools'

const parsers = {
  html: HtmlParser,
  json: JsonParser
}
export const parserClassFactory = (
  config: ScrapeConfig,
  options: Options,
  tools: Tools
) => {
  // TODO use type guards
  if (config.parse) {
    return new parsers[config.parse.expect](config, options, tools)
  } else {
    return new IdentityParser(config, options, tools)
  }
}
export type ParserClass = HtmlParser | JsonParser | IdentityParser
