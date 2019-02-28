import { assertType } from 'typescript-is'
import { ParamsInit } from './types'
import { RuntimeTypeError } from '../../util/error'

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const assertParamsType = (paramsInit: any) => {
  try {
    assertType<ParamsInit>(paramsInit)
  } catch (e) {
    throw new RuntimeTypeError(e.message)
  }
}
