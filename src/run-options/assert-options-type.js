// @flow
/* @flow-runtime */

import { reify, assert } from 'flow-runtime'
import type { Type } from 'flow-runtime'
import type { OptionsAll, OptionsNamed } from './type'

export const RuntimeConfigType = (reify: Type<Options>)

export const assertOptionsAllType = (options: OptionsAll) => true

export const assertOptionsNamedType = (options: OptionsNamed) => true
