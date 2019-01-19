import cheerio from 'cheerio'
import { AbstractParser } from '../abstract'
// type imports
import { ScrapeConfig } from '../../../../settings/config/types'
import { Options } from '../../../../settings/options/types'
import { Tools } from '../../../../tools'

export class Parser extends AbstractParser {
  private parser: (value: string) => string[]

  public constructor(config: ScrapeConfig, options: Options, tools: Tools) {
    super(config, options, tools)
    this.parser = this.attribute ? this.selectAttrVals : this.selectTextVals
  }
  protected parse = (value: string) => this.parser(value)

  private selectTextVals = (value: string) => {
    const $ = cheerio.load(value)
    const values: string[] = []
    const selection = $(this.selector)
    selection.each(function() {
      values.push($(this).text())
    })
    return values
  }
  private selectAttrVals = (value: string) => {
    const $ = cheerio.load(value)
    const values: string[] = []
    const selection = $(this.selector)
    selection.attr(this.attribute, (i: number, attributeVal: string) => {
      if (attributeVal) values.push(attributeVal)
    })
    return values
  }
}
