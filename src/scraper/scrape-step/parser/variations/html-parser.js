import cheerio from 'cheerio'

export default config => ({ store }) => value => {
  const { selector, attribute } = config.parse
  const $ = cheerio.load(value)
  const selection = $(selector)
  const values = []
  if (attribute) {
    selection.attr(attribute, (i, attributeVal) => {
      if (attributeVal.length) values.push(attributeVal)
    })
  } else {
    selection.text((i, textVal) => {
      if (textVal.length) values.push(textVal)
    })
  }
  return values
}
