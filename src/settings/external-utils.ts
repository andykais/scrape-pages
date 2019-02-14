import { normalizeConfig, flattenConfig, assertConfigType } from './config'
import { normalizeOptions, assertOptionsType } from './options'

export const config = {
  normalize: normalizeConfig,
  flatten: flattenConfig,
  verify: assertConfigType
}
export const options = {
  normalize: normalizeOptions,
  verify: assertOptionsType
}
