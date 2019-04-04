// type imports
import { ScrapeSettings } from '../../../settings'
import { ScraperName, ParseConfig } from '../../../settings/config/types'
import { Tools } from '../../../tools'

// export type ParserValues = string[] | [undefined | string]
export type ParserValues = string[]
/**
 * base abstract class which other downloaders derive from
 */
export abstract class AbstractParser {
  public type: ParseConfig['format'] | 'identity'
  public trim: <T>(values: T[]) => T[]
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

    this.trim =
      parseConfig && parseConfig.limit !== undefined
        ? this._trim(parseConfig.limit)
        : <T>(values: T[]) => values
  }
  /**
   * @param value only ever `undefined` if a download step has `read: false`.
   */
  public run = (value: string | undefined) => this.trim(this.parse(value))

  private _trim = (limit: number) => <T>(values: T[]): T[] => {
    return values.length > limit ? values.splice(0, limit) : values
  }

  protected abstract parse: (value?: string) => ParserValues
}
