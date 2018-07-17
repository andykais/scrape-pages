import cheerio from 'cheerio'

export default config => ({ store }) => value => {
  const { selector, attribute } = config.parse
  const $ = cheerio.load(value)
  const selection = $(selector)
  const values = []
  if (attribute) {
    selection.attr(attribute, (i, attributeVal) => {
      values.push(attributeVal)
    })
  } else {
    selection.text((i, textVal) => {
      values.push(textVal)
    })
  }
  return values
}
