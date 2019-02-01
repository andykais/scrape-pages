import cheerio from 'cheerio'
import { AbstractParser } from '../abstract'
// type imports
import { ScraperName, ParseConfig } from '../../../../settings/config/types'
import { Options } from '../../../../settings/options/types'
import { Tools } from '../../../../tools'

export class Parser extends AbstractParser {
  protected config: ParseConfig
  private parser: (value: string) => string[]

  public constructor(
    scraperName: ScraperName,
    config: ParseConfig,
    options: Options,
    tools: Tools
  ) {
    super(scraperName, config, options, tools)
    this.config = config // must be set on again on child classes https://github.com/babel/babel/issues/9439
    this.parser = this.config.attribute
      ? this.selectAttrVals(this.config.attribute)
      : this.selectTextVals
  }
  protected parse = (value: string) => this.parser(value)

  private selectTextVals = (value: string) => {
    const $ = cheerio.load(value)
    const values: string[] = []
    const selection = $(this.config.selector)
    selection.each(function() {
      values.push($(this).text())
    })
    return values
  }
  private selectAttrVals = (attribute: string) => (value: string) => {
    const $ = cheerio.load(value)
    const values: string[] = []
    const selection = $(this.config.selector)
    selection.attr(attribute, (i: number, attributeVal: string) => {
      if (attributeVal) values.push(attributeVal)
    })
    return values
  }
}
