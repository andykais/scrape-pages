import { assertType } from 'typescript-is'
import { OptionsInit } from './types'
import { typescriptIsWrapper } from '../../util/error'

export const assertOptionsType = typescriptIsWrapper(optionsInit =>
  assertType<OptionsInit>(optionsInit)
)
