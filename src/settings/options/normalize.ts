import { flattenConfig } from '../config/flatten'
import { typecheckOptions } from '../../util/typechecking.runtime'
// type imports
import { OptionsInit, ScrapeOptions, FlatOptions } from './types'
import { Config } from '../config/types'

const normalizeOptions = (config: Config, optionsInit: OptionsInit): FlatOptions => {
  typecheckOptions(optionsInit)

  const flatConfig = flattenConfig(config)
  const { optionsEach = {}, ...globalOptions } = optionsInit

  const defaults: ScrapeOptions = {
    downloadPriority: 0,
    logLevel: 'error',
    cache: false,
    ...globalOptions // user preferences for all things override
  }

  const options: FlatOptions = flatConfig.map((scraperConfig, name) => ({
    ...defaults,
    ...optionsEach[name]
  }))

  return options
}

export { normalizeOptions }
