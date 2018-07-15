import htmlParser from './variations/html-parser'
import jsonParser from './variations/json-parser'
import identityParser from './variations/identity-parser'

export default config => {
  const parsers = {
    html: htmlParser,
    json: jsonParser
  }

  if (config.parse) return parsers[config.parse.expect](config)
  else return identityParser(config)
}
