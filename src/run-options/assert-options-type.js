// @flow
/* @flow-runtime */

import { reify, assert } from 'flow-runtime'
import type { Type } from 'flow-runtime'
import type { Options } from './type'

export const RuntimeOptionsType = (reify: Type<Options>)

export const assertOptionsType = (options: Options) => {
  RuntimeOptionsType.assert(options)
}
