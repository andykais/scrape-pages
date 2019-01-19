import { normalizeConfig, makeFlatConfig, assertConfigType } from './config'
import { normalizeOptions, assertOptionsType } from './options'

export const config = {
  normalize: normalizeConfig,
  flatten: makeFlatConfig,
  verify: assertConfigType
}
export const options = {
  normalize: normalizeOptions,
  verify: assertOptionsType
}
