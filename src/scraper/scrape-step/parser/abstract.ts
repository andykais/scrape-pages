import { ScrapeConfig } from '../../../configuration/site-traversal/types'
import { RunOptions } from '../../../configuration/run-options/types'
import { Dependencies } from '../../types'

export type ParserValues = string[] | [undefined | string]
/**
 * base abstract class which other downloaders derive from
 */
export abstract class AbstractParser {
  protected config: ScrapeConfig
  protected runParams: RunOptions
  protected deps: Dependencies
  protected selector: string
  protected attribute: string

  public constructor(
    config: ScrapeConfig,
    runParams: RunOptions,
    deps: Dependencies
  ) {
    Object.assign(this, { config, runParams, deps, ...config.parse })
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
