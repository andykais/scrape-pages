import cheerio from 'cheerio'
import { AbstractParser } from '../abstract'
// type imports
import { ScrapeSettings } from '../../../../settings'
import { ScraperName, ParseConfig } from '../../../../settings/config/types'
import { ScrapeOptions } from '../../../../settings/options/types'
import { Tools } from '../../../../tools'

export class Parser extends AbstractParser {
  protected parseConfig: ParseConfig
  private parser: (value: string) => string[]

  public constructor(
    scraperName: ScraperName,
    parseConfig: ParseConfig,
    settings: ScrapeSettings,
    tools: Tools
  ) {
    super(scraperName, parseConfig, settings, tools)
    this.parseConfig = parseConfig // must be set on again on child classes https://github.com/babel/babel/issues/9439
    this.parser = this.parseConfig.attribute
      ? this.selectAttrVals(this.parseConfig.attribute)
      : this.selectTextVals
  }
  protected parse = (value: string) => this.parser(value)

  private selectTextVals = (value: string) => {
    const $ = cheerio.load(value)
    const values: string[] = []
    const selection = $(this.parseConfig.selector)
    selection.each(function() {
      values.push($(this).text())
    })
    return values
  }
  private selectAttrVals = (attribute: string) => (value: string) => {
    const $ = cheerio.load(value)
    const values: string[] = []
    const selection = $(this.parseConfig.selector)
    selection.attr(attribute, (i: number, attributeVal: string) => {
      if (attributeVal) values.push(attributeVal)
    })
    return values
  }
}
