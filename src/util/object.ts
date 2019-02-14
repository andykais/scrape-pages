/**
 * behaves like Array.prototype.map for objects
 */
const mapObject = <T, V>(object: { [key: string]: T }, fn: (value: T, key: string) => V) => {
  const mappedObject: { [key: string]: V } = {}
  for (const key in object) {
    mappedObject[key] = fn(object[key], key)
  }
  return mappedObject
}

// type cannot represent replacing a toplevel array, so we wont support it in `replaceInObject`
type ReplaceInObject<I extends {}, Find, ReplaceWith> = I extends Find
  ? ReplaceWith
  : {
      [K in keyof I]: I[K] extends Find
        ? ReplaceWith
        : I[K] extends any[] ? ReplaceInObject<I[K][number], Find, ReplaceWith>[] : I[K]
    }
/**
 * immutable find-and-replace function for objects. Searches recursively in object for values
 */
const replaceInObject = <T extends {}, Find, ReplaceWith>(
  shouldReplace: (val: any, key: string) => val is Find,
  fn: (val: Find, key: string) => ReplaceWith,
  baseObject: T
) => {
  const recurse = (object: T): ReplaceInObject<T, Find, ReplaceWith> => {
    const replacedIn = {}
    for (const [key, val] of Object.entries(object)) {
      if (shouldReplace(val, key)) (replacedIn as any)[key] = fn(val, key)
      else if (Array.isArray(val)) (replacedIn as any)[key] = val.map(recurse)
      else if (typeof val === 'object') (replacedIn as any)[key] = recurse(val as T)
    }
    return replacedIn as ReplaceInObject<T, Find, ReplaceWith>
  }
  return recurse(baseObject)
}

// this type accomplishes what both ReplaceInObject and Marshal are trying to do
type Marshal<I extends {}> = I extends Map<any, infer Value>
  ? { [key: string]: Value }
  : {
      [K in keyof I]: I[K] extends void
        ? I[K]
        : I[K] extends Voidable<Map<any, infer Value>>
          ? { [key: string]: Value }
          : I[K] extends Voidable<Array<infer Value>>
            ? Marshal<Value>[]
            : I[K] extends {} ? Marshal<I[K]> : I[K]
    }
// marshalling function
const isEs6Map = <K, V>(val: any): val is Map<K, V> => val instanceof Map
const es6MapToObject = <K, V>(map: Map<K, V>): { [key: string]: V } => {
  const obj: { [key: string]: V } = {}
  for (const [key, val] of map) obj[key.toString()] = val
  return obj
}
const marshalObject = <T extends {}>(object: T) =>
  (replaceInObject(isEs6Map, es6MapToObject, object) as any) as Marshal<T>

const marshaller = <T extends {}, F extends (...args: any[]) => T>(fn: F) => (
  ...args: ArgumentTypes<F>
) => marshalObject(fn(...args) as ReturnType<F>)

const safeCurry = <T, F extends (...args: any[]) => T, G extends (fResult: T) => any>(
  gFn: G,
  fFn: F
) => (...args: ArgumentTypes<F>): T => gFn(fFn(...args))

// ======================== SAMPLE ============================ //

const sample: Input = {
  m: new Map([['a', 1]])
}
type Input = { m: Map<string, number>; children?: Input[] }
// type Input = { m: Map<string, number>; children?: undefined }
const outputActual = marshalObject(sample)
type Output = {
  m: {
    [key: string]: number
  }
  // children?: undefined
  children?: { m: { [key: string]: number } }[]
}
const outputExpected: Output = outputActual

// const curried = safeCurry((obj: Output) => obj, (obj: Input) => marshalObject(obj))
// const curried = safeCurry(marshalObject, (obj: Input) => obj) // XXX
const curried = marshaller((obj: Input) => obj)
// const curried = safeCurry(<T>(obj: T) => obj, (obj: Input) => obj) // XXX
// const curried = safeCurry((x: boolean) => x, (x: number) => x)
const curriedOutput: Output = curried(sample)

// ======================== SAMPLE ============================ //

export { mapObject, replaceInObject, marshalObject, marshaller }
