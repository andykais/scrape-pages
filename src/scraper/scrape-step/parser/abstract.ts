import { ScraperName, ParseConfig } from '../../../settings/config/types'
import { Options } from '../../../settings/options/types'
import { Tools } from '../../../tools'

export type ParserValues = string[] | [undefined | string]
/**
 * base abstract class which other downloaders derive from
 */
export abstract class AbstractParser {
  protected scraperName: ScraperName
  protected config: ParseConfig | undefined
  protected options: Options
  protected tools: Tools
  protected selector: string
  protected attribute: string

  public constructor(
    scraperName: ScraperName,
    config: ParseConfig | undefined,
    options: Options,
    tools: Tools
  ) {
    Object.assign(this, { scraperName, config, options, tools })
  }
  /**
   * @param value only ever `undefined` if a download step has `read: false`.
   */
  public run = (value?: string) => this.parse(value)

  protected abstract parse: (value?: string) => ParserValues
}
