import { normalizeConfig, flattenConfig } from './config'
import { normalizeOptions } from './options'
import { normalizeParams } from './params'
import { typecheckConfig, typecheckOptions, typecheckParams } from '../util/typechecking.runtime'

export const config = {
  normalize: normalizeConfig,
  flatten: flattenConfig,
  typecheck: typecheckConfig
}
export const options = {
  normalize: normalizeOptions,
  typecheck: typecheckOptions
}

export const params = {
  normalize: normalizeParams,
  typecheck: typecheckParams
}
