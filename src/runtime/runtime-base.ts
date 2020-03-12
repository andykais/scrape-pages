const INITIALIZED = Symbol('INITIALIZED')

abstract class RuntimeBase {
  public [INITIALIZED] = false
  public constructor(public name: string) {}
  public abstract async initialize(folder: string): Promise<void>
  public mustBeInitialized() {
    if (!this[INITIALIZED])
      throw new Error(`${this.name} must be initialized before calling this method.`)
  }
  public abstract async cleanup(...args: any[]): Promise<void>
}

export { RuntimeBase }
