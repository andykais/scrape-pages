import * as path from 'path'
import { typecheckParams } from '../../util/typechecking.runtime'
// type imports
import { Config } from '../config/types'
import { FlatOptions } from '../options/types'
import { ParamsInit, ScrapeParams, FlatParams } from './types'

const getConfigInputValues = (config: Config, paramsInit: ParamsInit): ScrapeParams['input'] => {
  const initInputs = paramsInit.input || {}

  const optionsMissingInputKeys = config.input.filter(key => initInputs[key] === undefined)
  if (optionsMissingInputKeys.length) {
    throw new Error(`Invalid input! Params is missing keys(s) [${optionsMissingInputKeys.join()}]`)
  }

  return config.input.reduce((acc: ScrapeParams['input'], inputKey) => {
    acc[inputKey] = initInputs[inputKey]
    return acc
  }, {})
}
const normalizeParams = (
  config: Config,
  flatOptions: FlatOptions,
  paramsInit: ParamsInit
): FlatParams => {
  typecheckParams(paramsInit)

  const input = getConfigInputValues(config, paramsInit)
  const params = flatOptions.map((scraperOptions, name) => ({
    input,
    folder: path.resolve(paramsInit.folder, name)
  }))
  return params
}

export { normalizeParams }
