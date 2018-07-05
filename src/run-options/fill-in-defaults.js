import { makeFlatConfig } from '../configuration/make-flat-config'
import { assertOptionsType } from './assert-options-type'

const fillInDefaults = (config, options) => {
  assertOptionsType(options)
  const flatConfig = makeFlatConfig(config)

  const { optionsAll = {}, optionsNamed = {} } = options

  const defaults = {
    cache: true,
    request: {},
    limit: undefined,
    return: true
  }

  const optionsDefaulted = {
    ...options,
    optionsAll: Object.assign({}, defaults, optionsAll)
  }
  for (const name of Object.keys(flatConfig)) {
    optionsDefaulted[name] = {
      ...optionsDefaulted.optionsAll,
      ...optionsDefaulted[name]
    }
  }
  return optionsDefaulted
}

export { fillInDefaults }
