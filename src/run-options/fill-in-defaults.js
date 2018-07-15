import { resolve } from 'path'
import { makeFlatConfig } from '../configuration/make-flat-config'
import { assertOptionsType } from './assert-options-type'

const fillInDefaults = (config, runParams) => {
  assertOptionsType(runParams)
  const flatConfig = makeFlatConfig(config)
  const { optionsEach = {}, ...globalOptions } = runParams

  const defaults = {
    cache: true,
    request: {},
    useLimiter: true,
    return: true,
    ...globalOptions // user preferences for all things override
  }

  const options = Object.values(flatConfig).reduce((acc, scraperConfig) => {
    const { name } = scraperConfig
    const scraperOptions = optionsEach[name]
    acc[name] = {
      ...defaults,
      folder: resolve(defaults.folder, name),
      ...scraperOptions
    }
    return acc
  }, {})

  return options
}
export { fillInDefaults }
