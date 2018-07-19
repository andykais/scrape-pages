// @flow
/* @flow-runtime */

import { reify } from 'flow-runtime'
import type { Type } from 'flow-runtime'
import type { Config } from './type'

export const RuntimeConfigType = (reify: Type<Config>)

export const assertConfigType = (config: Config) => {
  RuntimeConfigType.assert(config)
}
