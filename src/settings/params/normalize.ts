import { Config } from '../config/types'
import { FlatOptions } from '../options/types'
import { ParamsInit, Params, FlatParams } from './types'

const getConfigInputValues = (config: Config, paramsInit: ParamsInit): Params['input'] => {
  const initInputs = paramsInit.input || {}

  const optionsMissingInputKeys = config.input.filter(key => initInputs[key] === undefined)
  if (optionsMissingInputKeys.length) {
    throw new Error(`Invalid input! Options is missing keys(s) [${optionsMissingInputKeys.join()}]`)
  }

  return config.input.reduce((acc: Params['input'], inputKey) => {
    acc[inputKey] = initInputs[inputKey]
    return acc
  }, {})
}
const normalizeParams = (
  config: Config,
  flatOptions: FlatOptions,
  paramsInit: ParamsInit
): FlatParams => {
  const input = getConfigInputValues(config, paramsInit)
  const params = flatOptions.map((scraperOptions, name) => ({
    input,
    folder: paramsInit.folder
  }))
  return params
}

export { normalizeParams }
