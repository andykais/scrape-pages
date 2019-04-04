import { assertType } from 'typescript-is'
import { ConfigInit } from './types'
import { RuntimeTypeError } from '../../util/error'

export const assertConfigType = (configInit: any) => {
  try {
    assertType<ConfigInit>(configInit)
  } catch (e) {
    throw new RuntimeTypeError(e.message)
  }
}
