import { assertType } from 'typescript-is'
import { OptionsInit } from './types'
import { RuntimeTypeError } from '../../util/error'

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const assertOptionsType = (optionsInit: any) => {
  try {
    assertType<OptionsInit>(optionsInit)
  } catch (e) {
    throw new RuntimeTypeError(e.message)
  }
}
