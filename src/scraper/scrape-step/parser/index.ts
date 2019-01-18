import { Parser as HtmlParser } from './implementations/html'
import { Parser as JsonParser } from './implementations/json'
import { Parser as IdentityParser } from './implementations/identity'
// type imports
import { ScrapeConfig } from '../../../settings/config/types'
import { RunOptions } from '../../../settings/options/types'
import { Tools } from '../../../tools'

const parsers = {
  html: HtmlParser,
  json: JsonParser
}
export const parserClassFactory = (
  config: ScrapeConfig,
  runParams: RunOptions,
  tools: Tools
) => {
  // TODO use type guards
  if (config.parse) {
    return new parsers[config.parse.expect](config, runParams, tools)
  } else {
    return new IdentityParser(config, runParams, tools)
  }
}
