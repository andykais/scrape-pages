class FMap<K = any, V = any> extends Map<K, V> {
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
    for (const [key, val] of this.entries()) {
      mapped.set(key, fn(val, key))
    }
    return mapped
  }
}

export { FMap }
