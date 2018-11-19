import { parser as htmlParser } from './variations/html-parser'
import { parser as jsonParser } from './variations/json-parser'
import { parser as identityParser } from './variations/identity-parser'
import { ScrapeConfig } from '../../../configuration/site-traversal/types'

export type ParserType = (
  config: ScrapeConfig
) => () => (value: string) => string[]

export default (config: ScrapeConfig) => {
  const parsers = {
    html: htmlParser,
    json: jsonParser
  }

  return config.parse
    ? parsers[config.parse.expect](config)
    : identityParser(config)
}
