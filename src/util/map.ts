type MapLike<K, V> = FMap<K, V> | Map<K, V>

class FMap<K = any, V = any> extends Map<K, V> {
  public constructor(pairs?: [K, V][]) {
    super(pairs)
    this.has = this.has.bind(this)
    this.get = this.get.bind(this)
    this.toObject = this.toObject.bind(this)
  }

  public static fromObject = <T>(object: { [key: string]: T }): FMap<string, T> => {
    const fmap = new FMap<string, T>()
    for (const [key, val] of Object.entries(object)) {
      fmap.set(key, val)
    }
    return fmap
  }

  public toObject(): { [key: string]: V }
  public toObject<T>(fn: (val: V, key: K) => T): { [key: string]: T }
  public toObject<T>(fn: (val: V, key: K) => T | V = (v: V) => v) {
    const object: { [key: string]: T | V } = {}
    for (const [key, val] of this) {
      object[key.toString()] = fn(val, key)
    }
    return object
  }

  public getOrElse = <T>(key: K, fn: () => T): T | V => {
    if (this.has(key)) {
      return this.get(key)!
    } else {
      return fn()
    }
  }
  public getOrThrow = (key: K) =>
    this.getOrElse(key, () => {
      throw new RangeError(`key ${key} does not exist`)
    })

  public map = <T>(fn: (val: V, key: K) => T): FMap<K, T> => {
    const mapped = new FMap<K, T>()
    for (const [key, val] of this) {
      mapped.set(key, fn(val, key))
    }
    return mapped
  }

  public reduce = <T>(fn: (acc: T, val: V, key: K, map: FMap<K, V>) => T, initializer: T): T => {
    let acc = initializer
    for (const [key, val] of this) {
      acc = fn(acc, val, key, this)
    }
    return acc
  }

  public merge = (fmap: MapLike<K, V>): FMap<K, V> => {
    const merged = new FMap<K, V>([...this])
    for (const [key, val] of fmap) {
      merged.set(key, val)
    }
    return merged
  }
}

export { FMap }
