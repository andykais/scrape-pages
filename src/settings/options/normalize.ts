import { resolve } from 'path'
import { flattenConfig } from '../config/flatten'
import { assertOptionsType } from './'
import { FMap } from '../../util/map'
// type imports
import { Input, OptionsInit, FlatOptions } from './types'
import { Config } from '../config/types'

const getConfigInputValues = (config: Config, options: OptionsInit) => {
  const configInputKeys = config.input.map(input => {
    if (typeof input === 'string') return input
    else return input.name
  })

  const initInputs = options.input || {}
  const filteredInputs: Input = {}
  for (const inputKey of configInputKeys) {
    if (initInputs[inputKey] === undefined) {
      const missingKeys = configInputKeys
        .filter(key => initInputs[key] === undefined)
        .join()
      throw new Error(
        `Invalid input! Options is missing keys(s) [${missingKeys}]`
      )
    }
    filteredInputs[inputKey] = initInputs[inputKey]
  }
  return filteredInputs
}

const normalizeOptions = (
  config: Config,
  optionsInit: OptionsInit
): FlatOptions => {
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
