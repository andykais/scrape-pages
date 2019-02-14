import { normalizeConfig, flattenConfig, assertConfigType } from './config'
import { normalizeOptions, assertOptionsType } from './options'
import { marshaller } from '../util/object'

export const config = {
  normalize: marshaller(normalizeConfig),
  flatten: marshaller(flattenConfig),
  verify: assertConfigType
}
export const options = {
  normalize: marshaller(normalizeOptions),
  verify: assertOptionsType
}
