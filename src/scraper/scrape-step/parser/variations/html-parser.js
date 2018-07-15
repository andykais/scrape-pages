import cheerio from 'cheerio'
import artoo from 'artoo-js'

artoo.bootstrap(cheerio)

export default config => ({ store }) => value => {
  // parse from config
  const $ = cheerio.load(value)
  const parsedValues = $(config.parse.selector)
    .scrape(config.parse.attribute)
    .filter(val => val !== undefined)

  return parsedValues
}
