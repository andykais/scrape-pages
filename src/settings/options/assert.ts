import { assertType } from 'typescript-is'
import { OptionsInit } from './types'

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const assertOptionsType = (optionsInit: any) => {
  assertType<OptionsInit>(optionsInit)
}
