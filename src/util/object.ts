const copy = (obj: {}) => JSON.parse(JSON.stringify(obj))

// const merge = <A extends {} | [], B extends {} | [], C>(a: A, b: B) => {
//   if (Array.isArray(b)) {
//     const union = []
//     const aAsArray = Array.isArray(a) ? a : [a]
//     for (let i = 0; i < Math.max(b.length, aAsArray.length); i++) {
//       if (aAsArray.length > i && b.length > i) union[i] = merge(aAsArray[i], b[i])
//       else if (b.length > i) union[i] = b[i]
//       else union[i] = aAsArray[i]
//     }
//     return union
//   } else if (typeof a === 'object' && typeof b === 'object') {
//     for (const key in b) {
//     }
//   }
//   return []
// }

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

export { copy, replaceInObject, marshalObject, marshaller }
