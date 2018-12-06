import cheerio from 'cheerio'
import { ParserType } from '../'

const selectTextVals = (value: string, selector: string): string[] => {
  const $ = cheerio.load(value)
  const values: string[] = []
  const selection = $(selector)
  selection.each(function() {
    values.push($(this).text())
  })
  return values
}

const selectAttrVals = (
  value: string,
  selector: string,
  attribute: string
): string[] => {
  const $ = cheerio.load(value)
  const values: string[] = []
  const selection = $(selector)
  selection.attr(attribute, (i: number, attributeVal: string) => {
    if (attributeVal) values.push(attributeVal)
  })
  return values
}

export const parser: ParserType = config => {
  const { selector, attribute } = config.parse
  const parseVal = attribute ? selectAttrVals : selectTextVals
  return () => value => parseVal(value, selector, attribute)
}
