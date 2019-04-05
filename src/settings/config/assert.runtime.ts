import { assertType } from 'typescript-is'
import { ConfigInit } from './types'
import { typescriptIsWrapper } from '../../util/error'

export const assertConfigType = typescriptIsWrapper(configInit =>
  assertType<ConfigInit>(configInit)
)
