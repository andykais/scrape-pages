import cheerio from 'cheerio'
import artoo from 'artoo-js'
import BaseStep from '../base-scraper'
import IdentityStep from '../identity-scraper'

artoo.bootstrap(cheerio)

class HtmlParser extends BaseStep {
  _run = () => value => {
    if (!value) return []
    const $ = cheerio.load(value)
    const element = $(this.parse.selector)
    const parsedVal = $(this.parse.selector).scrape(this.parse.attribute)
    return parsedVal || []
  }
}

class JsonParser extends BaseStep {}

export default setupParams => {
  const parsers = {
    html: HtmlParser,
    json: JsonParser
  }
  const chosenParser = parsers[setupParams.expect] || IdentityStep
  return new chosenParser(setupParams)
}
