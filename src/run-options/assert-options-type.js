// @flow
/* @flow-runtime */

import { reify, assert } from 'flow-runtime'
import type { Type } from 'flow-runtime'
import type { Options } from './type'

export const RuntimeConfigType = (reify: Type<Options>)

export const assertOptionsType = (options: Options) => true
