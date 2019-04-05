import { assertType } from 'typescript-is'
import { ParamsInit } from './types'
import { typescriptIsWrapper } from '../../util/error'

export const assertParamsType = typescriptIsWrapper(paramsInit =>
  assertType<ParamsInit>(paramsInit)
)
