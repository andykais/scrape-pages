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
  public postProcess: (values: string[]) => string[]
  protected scraperName: ScraperName
  protected parseConfig: ParseConfig | undefined
  protected config: ScrapeSettings['config']
  protected options: ScrapeSettings['options']
  protected params: ScrapeSettings['params']
  protected tools: Tools
  protected selector: string
  protected attribute: string

  public constructor(parseConfig: ParseConfig | undefined, settings: ScrapeSettings, tools: Tools) {
    const scraperName = settings.config.name
    Object.assign(this, { scraperName, parseConfig, ...settings, tools })

    this.postProcess = this.getPostProcessing(parseConfig)
  }
  /**
   * @param value only ever `undefined` if a download step has `read: false`.
   */
  public run = (value: string | undefined) => this.postProcess(this.parse(value))

  private getRegexCleanup = ({ regexCleanup }: ParseConfig) => {
    if (regexCleanup) {
      const regex = new RegExp(regexCleanup.selector, regexCleanup.flags)
      return (value: string) => value.replace(regex, regexCleanup.replacer)
    } else {
      return (value: string) => value
    }
  }
  private valueNeedsPostProcessing = ({ regexCleanup, limit }: ParseConfig) => {
    return limit !== undefined || regexCleanup
  }
  private getPostProcessing = (parseConfig?: ParseConfig) => {
    if (parseConfig) {
      const { limit } = parseConfig
      const regexReplace = this.getRegexCleanup(parseConfig)
      if (this.valueNeedsPostProcessing(parseConfig)) {
        return (values: string[]) => {
          const length = limit ? Math.min(limit, values.length) : values.length
          const processedValues = new Array(length)
          for (let i = 0; i < length; i++) {
            processedValues[i] = regexReplace(values[i])
          }
          return processedValues
        }
      }
    }
    return (values: string[]) => values
  }

  protected abstract parse(value?: string): ParserValues
}
