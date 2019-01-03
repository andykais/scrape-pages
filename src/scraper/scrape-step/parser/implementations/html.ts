import cheerio from 'cheerio'
import { AbstractParser } from '../abstract'
// type imports
import { ScrapeConfig } from '../../../../configuration/site-traversal/types'
import { RunOptions } from '../../../../configuration/run-options/types'
import { Dependencies } from '../../../types'

export class Parser extends AbstractParser {
  private parser: (value: string) => string[]

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
  protected parse = (value: string) => this.parser(value)

  public constructor(
    config: ScrapeConfig,
    runParams: RunOptions,
    deps: Dependencies
  ) {
    super(config, runParams, deps)
    this.parser = this.attribute ? this.selectAttrVals : this.selectTextVals
  }
}
