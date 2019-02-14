import { normalizeConfig, flattenConfig, assertConfigType } from './config'
import { normalizeOptions, assertOptionsType } from './options'

type ReplaceTypeWith<Object, Replace, With> = {}
type VariableArgFunction = (...params: any[]) => {}
// type Ret = ReturnType<VariableArgFunction>
const serializeHof = <F extends VariableArgFunction>(fn: F) => {
  type Returned = ReturnType<F>
  return (...args: ArgumentTypes<F>): Returned => {
    const result: Returned = fn(...args) as Returned
    for (const key in result) {
      result[key] = 5
    }
    return result
  }
}
const makeAnObj = (name: string, slug: string) => ({
  name,
  slug
})
const serializer = serializeHof(makeAnObj)
const result = serializer('Test Maintenance', 'test-maintenance')
const serialize = <T extends {}>(object: T) => {
  const result = {}
  for (const key in result) {
    result[key] = 5
  }
  return result
}
const result2 = serialize(makeAnObj('Test Maintenance', 'test-maintenance'))

export const config = {
  normalize: normalizeConfig,
  flatten: flattenConfig,
  verify: assertConfigType
}
export const options = {
  normalize: normalizeOptions,
  verify: assertOptionsType
}
