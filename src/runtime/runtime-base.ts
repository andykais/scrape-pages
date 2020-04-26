const INITIALIZED = Symbol('INITIALIZED')

class RuntimeBase {
  public [INITIALIZED] = false
  public constructor(public name: string) {}
  public async initialize(): Promise<void> {
    this[INITIALIZED] = true
  }
  public isInitialized = () => this[INITIALIZED]
  public mustBeInitialized() {
    if (!this[INITIALIZED])
      throw new Error(`${this.name} must be initialized before calling this method.`)
  }
  public cleanup(...args: any[]): void {}
}

export { RuntimeBase }
