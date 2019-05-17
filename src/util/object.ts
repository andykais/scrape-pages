import { inspect } from 'util'

export const serialize = (object: {}) => inspect(object, { showHidden: false, depth: null })
