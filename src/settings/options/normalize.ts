import { resolve } from 'path'
import { flattenConfig } from '../config/flatten'
import { assertOptionsType } from './'
// type imports
import { Input, OptionsInit, FlatOptions } from './types'
import { Config } from '../config/types'

const getConfigInputValues = (config: Config, options: OptionsInit): Input => {
  const initInputs = options.input || {}

  const optionsMissingInputKeys = config.input.filter(key => initInputs[key] === undefined)
  if (optionsMissingInputKeys.length) {
    throw new Error(`Invalid input! Options is missing keys(s) [${optionsMissingInputKeys.join()}]`)
  }

  return config.input.reduce((acc: Input, inputKey) => {
    acc[inputKey] = initInputs[inputKey]
    return acc
  }, {})
}

const normalizeOptions = (config: Config, optionsInit: OptionsInit): FlatOptions => {
  assertOptionsType(optionsInit)

  const flatConfig = flattenConfig(config)
  const { optionsEach = {}, ...globalOptions } = optionsInit

  const input = getConfigInputValues(config, optionsInit)

  const defaults = {
    downloadPriority: 0,
    logLevel: 'error' as 'error',
    cache: true,
    read: true,
    write: false,
    ...globalOptions // user preferences for all things override
  }

  const options: FlatOptions = flatConfig.map((scraperConfig, name) => ({
    ...defaults,
    folder: resolve(defaults.folder, name),
    ...optionsEach[name],
    input
  }))

  return options
}

export { normalizeOptions }
