import { resolve } from 'path'
import { flattenConfig } from '../config/flatten'
import { assertOptionsType } from './'
// type imports
import { Input, OptionsInit, FlatOptions } from './types'
import { Config } from '../config/types'

const getConfigInputValues = (config: Config, options: OptionsInit) => {
  const initInputs = options.input || {}

  const optionsMissingInputKeys = config.input.filter(key => initInputs[key] === undefined)
  if (optionsMissingInputKeys.length) {
    throw new Error(`Invalid input! Options is missing keys(s) [${optionsMissingInputKeys.join()}]`)
  }

  return config.input.reduce((acc: Input, inputKey) => {
    acc[inputKey] = initInputs[inputKey]
    return acc
  }, {})

  const filteredInputs: Input = {}
  for (const inputKey of config.input) {
    if (initInputs[inputKey] === undefined) {
      const missingKeys = config.input.filter(key => initInputs[key] === undefined).join()
      throw new Error(`Invalid input! Options is missing keys(s) [${missingKeys}]`)
    }
    filteredInputs[inputKey] = initInputs[inputKey]
  }
  return filteredInputs
}

const normalizeOptions = (config: Config, optionsInit: OptionsInit): FlatOptions => {
  assertOptionsType(optionsInit)

  const flatConfig = flattenConfig(config)
  const { optionsEach = {}, ...globalOptions } = optionsInit

  const input = getConfigInputValues(config, optionsInit)
  // assertValidInput(config, options)

  const defaults = {
    cache: true,
    downloadPriority: 0,
    logLevel: 'error' as 'error',
    read: true,
    write: false,
    ...globalOptions // user preferences for all things override
  }

  const options: FlatOptions = flatConfig.map((scraperConfig, name) => {
    return {
      ...defaults,
      folder: resolve(defaults.folder, name),
      ...optionsEach[name],
      input
    }
  })

  return options
}

export { normalizeOptions }
