import { resolve } from 'path'
import { makeFlatConfig } from '../configuration/make-flat-config'
import { assertOptionsType } from './'
// type imports
import { RunOptionsInit, FlatRunOptions } from './types'
import { Config } from '../configuration/types'

const assertValidInput = (config: Config, runParams: RunOptionsInit) => {
  const configInputKeys = Object.keys(config.input)
  const runParamsInputKeys = Object.keys(runParams.input)
  if (configInputKeys.length < runParamsInputKeys.length) {
    const missingKeys = runParamsInputKeys
      .filter(key => !configInputKeys.includes(key))
      .join()
    throw new Error(`Invalid input! Options has extra key(s) [${missingKeys}]`)
  }
  if (configInputKeys.length > runParamsInputKeys.length) {
    const missingKeys = configInputKeys
      .filter(key => !runParamsInputKeys.includes(key))
      .join()
    throw new Error(`Invalid input! Config is missing key(s) [${missingKeys}]`)
  }
}

// TODO rename to normalizeConfig
const normalizeOptions = (config: Config, runParams: RunOptionsInit) => {
  assertOptionsType(runParams)
  assertValidInput(config, runParams)

  const flatConfig = makeFlatConfig(config)
  const { optionsEach = {}, ...globalOptions } = runParams

  const defaults = {
    input: {},
    cache: true,
    useLimiter: true,
    ...globalOptions // user preferences for all things override
  }

  const options: FlatRunOptions = Object.values(flatConfig).reduce(
    (acc: FlatRunOptions, scraperConfig) => {
      const { name } = scraperConfig
      const scraperOptions = optionsEach[name]
      acc[name] = {
        ...defaults,
        folder: resolve(defaults.folder, name),
        ...scraperOptions
      }
      return acc
    },
    {}
  )

  return options
}
export { normalizeOptions }
