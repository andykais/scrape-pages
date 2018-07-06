import htmlParser from './variations/html-parser'
import jsonParser from './variations/json-parser'
import identityParser from './variations/identity-parser'

export default setupParams => {
  const parsers = {
    html: htmlParser,
    json: jsonParser
  }

  const { config } = setupParams
  if (config.parse) return parsers[config.parse.expect](setupParams)
  else return identityParser(setupParams)
}
