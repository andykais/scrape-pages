import cheerio from 'cheerio'
import BaseStep from '../base-scraper'
import IdentityStep from '../identity-scraper'

class BaseParser {}

class HtmlParser extends BaseParser {
  _run = ({ parentValue }) => {
    console.log('parse html')
    const $ = cheerio.load(parentValue)
    return parentValue
  }
}

class JsonParser extends BaseParser {}

export default setupParams => {
  const parsers = {
    html: HtmlParser,
    json: JsonParser
  }
  const chosenParser = parsers[setupParams.expectedInput] || IdentityStep
  return new chosenParser(setupParams)
}
