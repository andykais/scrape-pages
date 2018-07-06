import cheerio from 'cheerio'
import artoo from 'artoo-js'
import BaseStep from '../base-scraper'
// import IdentityStep from '../identity-scraper'

artoo.bootstrap(cheerio)

class HtmlParser extends BaseStep {
  _run = () => async ({ value, downloadId }) => {
    if (value === undefined || value === null) return []
    // console.log(this.name, 'parsing', this.parse.selector)
    const $ = cheerio.load(value)
    const element = $(this.config.parse.selector)
    const parsedVals = $(this.config.parse.selector).scrape(
      this.config.parse.attribute
    )
    const cleanedVals = parsedVals.filter(val => val !== undefined)
    // if (this.config.name === 'level_0_index_0') {
    // console.log(cleanedVals)
    // }
    const values = cleanedVals || []
    if (this.config.name === 'level_0_index_0') this.logger.warn(values.length)

    return { value: cleanedVals || [], downloadId }
  }
}

class JsonParser extends BaseStep {}

class IdentityStep extends BaseStep {
  _run = () => async ({ value, downloadId }) => ({
    value: value ? [value] : [],
    downloadId
  })
}

export default setupParams => {
  const parsers = {
    html: HtmlParser,
    json: JsonParser
  }
  const chosenParser = parsers[setupParams.expect] || IdentityStep
  return new chosenParser(setupParams)
}
