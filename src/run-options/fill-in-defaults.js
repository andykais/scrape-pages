import { resolve } from 'path'
import { makeFlatConfig } from '../configuration/make-flat-config'
import {
  assertOptionsAllType,
  assertOptionsNamedType
} from './assert-options-type'

const fillInDefaults = (config, optionsAll, optionsNamed) => {
  assertOptionsAllType(optionsAll)
  assertOptionsNamedType(optionsNamed)

  const flatConfig = makeFlatConfig(config)

  const defaults = {
    cache: true,
    request: {},
    limit: undefined,
    return: true,
    ...optionsAll // user preferences for all things override
  }

  const options = {}
  for (const name of Object.keys(flatConfig)) {
    const scrapeStepOptions = optionsNamed[name] || {}
    const folder = scrapeStepOptions.folder
      ? scrapeStepOptions.folder
      : resolve(defaults.folder, name)

    options[name] = {
      ...defaults,
      ...optionsNamed[name],
      folder
    }
  }
  return options
}

export { fillInDefaults }
