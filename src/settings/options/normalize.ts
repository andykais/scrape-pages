import { resolve } from 'path'
import { makeFlatConfig } from '../config/make-flat-config'
import { assertOptionsType } from './'
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

  const flatConfig = makeFlatConfig(config)
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

  const options: FlatOptions = Object.values(flatConfig).reduce(
    (acc: FlatOptions, scraperConfig) => {
      const { name } = scraperConfig
      const scraperOptions = optionsEach[name]
      acc.set(name, {
        ...defaults,
        folder: resolve(defaults.folder, name),
        ...scraperOptions,
        input
      })
      return acc
    },
    new Map()
  )

  return options
}
export { normalizeOptions }
