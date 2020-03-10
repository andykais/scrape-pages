abstract class RuntimeBase {
  public initialized = false
  public constructor(public name: string) {}
  public abstract async initialize(): Promise<void>
  public mustBeInitialized() {
    if (!this.initialized)
      throw new Error(`${this.name} must be initialized before calling this method.`)
  }
  public abstract async cleanup(): Promise<void>
}

export { RuntimeBase }
