import jsonata from 'jsonata'
import { AbstractParser } from '../abstract'
// type imports
import { ScrapeSettings } from '../../../../settings'
import {
  ScraperName,
  ParseConfigInterface,
  ParseConfigJson
} from '../../../../settings/config/types'
import { Tools } from '../../../../tools'

export class Parser extends AbstractParser {
  public type: 'json' = 'json'
  protected parseConfig: ParseConfigJson
  private parser: jsonata.Expression

  public constructor(
    scraperName: ScraperName,
    parseConfig: ParseConfigJson,
    settings: ScrapeSettings,
    tools: Tools
  ) {
    super(scraperName, parseConfig, settings, tools)
    this.parseConfig = parseConfig // must be set on again on child classes https://github.com/babel/babel/issues/9439

    this.parser = jsonata(this.parseConfig.selector)
  }

  public static isJsonParseConfig = (
    parseConfig: ParseConfigInterface
  ): parseConfig is ParseConfigJson => (parseConfig as ParseConfigJson).format === 'json'

  public parse = (value: string) => {
    const object = JSON.parse(value)

    const result = this.parser.evaluate(object)

    return Array.isArray(result)
      ? result.map(val => (typeof val === 'object' ? JSON.stringify(val) : val.toString()))
      : typeof result === 'object'
      ? [JSON.stringify(result)]
      : [result.toString()]
  }
}
