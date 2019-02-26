import { assertType } from 'typescript-is'
import { ParamsInit } from './types'

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const assertParamsType = (paramsInit: any) => {
  assertType<ParamsInit>(paramsInit)
}
