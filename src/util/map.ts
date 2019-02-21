type MapLike<K, V> = FMap<K, V> | Map<K, V>

class FMap<K = any, V = any> extends Map<K, V> {
  public constructor(pairs?: [K, V][]) {
    super(pairs)
    this.has = this.has.bind(this)
    this.get = this.get.bind(this)
  }

  public static fromObject = <T>(object: { [key: string]: T }): FMap<string, T> => {
    const fmap = new FMap<string, T>()
    for (const [key, val] of Object.entries(object)) {
      fmap.set(key, val)
    }
    return fmap
  }

  public toObject = <T>(): { [key: string]: V } => {
    const object: { [key: string]: V } = {}
    for (const [key, val] of this) {
      object[key.toString()] = val
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

  public merge = (fmap: MapLike<K, V>): FMap<K, V> => {
    const merged = new FMap<K, V>([...this])
    for (const [key, val] of fmap) {
      merged.set(key, val)
    }
    return merged
  }
}

export { FMap }
