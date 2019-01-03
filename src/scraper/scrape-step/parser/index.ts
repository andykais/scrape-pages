import { Parser as HtmlParser } from './implementations/html'
import { Parser as JsonParser } from './implementations/json'
import { Parser as IdentityParser } from './implementations/identity'
// type imports
import { ScrapeConfig } from '../../../configuration/site-traversal/types'
import { RunOptions } from '../../../configuration/run-options/types'
import { Dependencies } from '../../types'

const parsers = {
  html: HtmlParser,
  json: JsonParser
}
export const parserClassFactory = (
  config: ScrapeConfig,
  runParams: RunOptions,
  dependencies: Dependencies
) => {
  // TODO use type guards
  if (config.parse) {
    return new parsers[config.parse.expect](config, runParams, dependencies)
  } else {
    return new IdentityParser(config, runParams, dependencies)
  }
}
