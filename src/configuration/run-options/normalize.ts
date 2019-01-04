import { resolve } from 'path'
import { makeFlatConfig } from '../site-traversal/make-flat-config'
import { assertOptionsType } from './'
// type imports
import { Input, RunOptionsInit, FlatRunOptions } from './types'
import { Config } from '../site-traversal/types'

const getConfigInputValues = (config: Config, runParams: RunOptionsInit) => {
  const configInputKeys = config.input.map(input => {
    if (typeof input === 'string') return input
    else return input.name
  })

  const initInputs = runParams.input || {}
  const filteredInputs: Input = {}
  for (const inputKey of configInputKeys) {
    if (initInputs[inputKey] === undefined) {
      const missingKeys = configInputKeys
        .filter(key => initInputs[inputKey] === undefined)
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
  runParams: RunOptionsInit
): FlatRunOptions => {
  assertOptionsType(runParams)

  const flatConfig = makeFlatConfig(config)
  const { optionsEach = {}, ...globalOptions } = runParams

  const input = getConfigInputValues(config, runParams)
  // assertValidInput(config, runParams)

  const defaults = {
    cache: true,
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
        ...scraperOptions,
        input
      }
      return acc
    },
    {}
  )

  return options
}
export { normalizeOptions }
