// type imports
import { ScrapeSettings } from '../../../settings'
import { ScraperName, ParseConfig } from '../../../settings/config/types'
import { Tools } from '../../../tools'

export type ParserValues = string[] | [undefined | string]
/**
 * base abstract class which other downloaders derive from
 */
export abstract class AbstractParser {
  protected scraperName: ScraperName
  protected parseConfig: ParseConfig | undefined
  protected config: ScrapeSettings['config']
  protected options: ScrapeSettings['options']
  protected params: ScrapeSettings['params']
  protected tools: Tools
  protected selector: string
  protected attribute: string

  public constructor(
    scraperName: ScraperName,
    parseConfig: ParseConfig | undefined,
    settings: ScrapeSettings,
    tools: Tools
  ) {
    Object.assign(this, { scraperName, parseConfig, ...settings, tools })
  }
  /**
   * @param value only ever `undefined` if a download step has `read: false`.
   */
  public run = (value?: string) => this.parse(value)

  protected abstract parse: (value?: string) => ParserValues
}
