import { resolve } from 'path'
import { makeFlatConfig } from '../site-traversal/make-flat-config'
import { assertOptionsType } from './'
// type imports
import { RunOptionsInit, FlatRunOptions } from './types'
import { Config } from '../site-traversal/types'

const assertValidInput = (config: Config, runParams: RunOptionsInit) => {
  const configInputKeys = Object.keys(config.input)
  const runParamsInputKeys = runParams.input ? Object.keys(runParams.input) : []
  if (configInputKeys.length < runParamsInputKeys.length) {
    const missingKeys = runParamsInputKeys
      .filter(key => !configInputKeys.includes(key))
      .join()
    throw new RangeError(
      `Invalid input! Options has extra key(s) [${missingKeys}]`
    )
  } else if (!configInputKeys.every(key => runParamsInputKeys.includes(key))) {
    const missingKeys = configInputKeys
      .filter(key => !runParamsInputKeys.includes(key))
      .join()
    throw new Error(
      `Invalid input! Options is missing keys(s) [${missingKeys}]`
    )
  }
}

const normalizeOptions = (config: Config, runParams: RunOptionsInit) => {
  assertOptionsType(runParams)

  const flatConfig = makeFlatConfig(config)
  const { optionsEach = {}, ...globalOptions } = runParams

  assertValidInput(config, runParams)

  const defaults = {
    input: {},
    cache: true,
    useLimiter: true,
    downloadPriority: 0,
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
