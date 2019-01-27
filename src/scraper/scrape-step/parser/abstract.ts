import { ScraperName, ScrapeConfig } from '../../../settings/config/types'
import { Options } from '../../../settings/options/types'
import { Tools } from '../../../tools'

export type ParserValues = string[] | [undefined | string]
/**
 * base abstract class which other downloaders derive from
 */
export abstract class AbstractParser {
  protected scraperName: ScraperName
  protected config: ScrapeConfig
  protected options: Options
  protected tools: Tools
  protected selector: string
  protected attribute: string

  public constructor(
    scraperName: ScraperName,
    config: ScrapeConfig,
    options: Options,
    tools: Tools
  ) {
    Object.assign(this, { config, options, tools, ...config.parse })
  }
  public run = (value?: string) => {
    /** TODO
     * ok I need to re-evaluate what an undefined passed value means
     * images should be undefined IF I MANUALLY SAY SO
     * but that will stop the flow from happening
     *
     * any time we say dont store the value, it will stop the flow
     * AND stop the scraper (unless we pass down a null value)
     * but storing images as text is a waste of energy
     */
    return this.parse(value)
  }
  protected abstract parse: (value?: string) => ParserValues
}
