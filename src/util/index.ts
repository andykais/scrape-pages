/**
 * This is a special file, it is not used internally.
 * It only exists for external use.
 */
import { normalizeConfig, flattenConfig } from '../settings/config'
import { normalizeOptions } from '../settings/options'
import { normalizeParams } from '../settings/params'
import { typecheckConfig, typecheckOptions, typecheckParams } from './typechecking.runtime'

/**
 * @public
 */
export const config = {
  normalize: normalizeConfig,
  flatten: flattenConfig,
  typecheck: typecheckConfig
}

/**
 * @public
 */
export const options = {
  normalize: normalizeOptions,
  typecheck: typecheckOptions
}

/**
 * @public
 */
export const params = {
  normalize: normalizeParams,
  typecheck: typecheckParams
}
