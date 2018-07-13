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
  // // write values to db
  // await store.insertBatchParsedValues({
    // name: config.name,
    // parentId,
    // downloadId,
    // values: parsedValues
  // })
  // const parsedValuesWithId = await store.getParsedValuesFromParentId(parentId)
  // console.log('withid', parsedValuesWithId.length)
  // return parsedValuesWithId
  // // return { parsedValues }
  // // return { parsedValues, nextParentId }
}
