import { normalizeConfig, makeFlatConfig, assertConfigType } from './config'
import { normalizeOptions, assertOptionsType } from './options'
import { marshaller } from '../util/object'

export const config = {
  normalize: marshaller(normalizeConfig),
  flatten: marshaller(makeFlatConfig),
  verify: assertConfigType
}
export const options = {
  normalize: marshaller(normalizeOptions),
  verify: assertOptionsType
}
