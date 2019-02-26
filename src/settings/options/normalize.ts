import { resolve } from 'path'
import { flattenConfig } from '../config/flatten'
import { assertOptionsType } from './'
// type imports
import { Input, OptionsInit, ScrapeOptions, FlatOptions } from './types'
import { Config } from '../config/types'

const normalizeOptions = (config: Config, optionsInit: OptionsInit): FlatOptions => {
  assertOptionsType(optionsInit)

  const flatConfig = flattenConfig(config)
  const { optionsEach = {}, maxConcurrent, rateLimit, ...globalOptions } = optionsInit

  const defaults: ScrapeOptions = {
    downloadPriority: 0,
    logLevel: 'error',
    cache: true,
    read: true,
    write: false,
    ...globalOptions // user preferences for all things override
  }

  const options: FlatOptions = flatConfig.map((scraperConfig, name) => ({
    ...defaults,
    ...optionsEach[name]
  }))

  return options
}

export { normalizeOptions }
