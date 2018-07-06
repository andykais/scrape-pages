import cheerio from 'cheerio'
import artoo from 'artoo-js'

artoo.bootstrap(cheerio)

export default ({ config, store }) => runParams => async ({ value }) => {
  // parse from config
  const $ = cheerio.load(value)
  const parsedValues = $(config.parse.selector)
    .scrape(config.parse.attribute)
    .filter(val => val !== undefined)
  // write values to db
  const nextParentId = await store.insertBatchParsedValues(parsedValues)
  return { parsedValues, nextParentId }
}
