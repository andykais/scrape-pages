import { ScrapeConfig } from '../../../configuration/site-traversal/types'
import { RunOptions } from '../../../configuration/run-options/types'
import { Dependencies } from '../../types'

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
  public run = (value: string) => {
    return this.parse(value)
  }
  protected abstract parse: (value: string) => string[]
}
