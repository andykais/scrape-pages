import { RuntimeBase } from '@scrape-pages/runtime/runtime-base'

class Store extends RuntimeBase {
  constructor() {
    super('Store')
  }

  public get qs() {
    this.mustBeInitialized()
    throw new Error('unimplemented')
  }
  public get transaction() {
    this.mustBeInitialized()
    throw new Error('unimplemented')
  }

  async initialize(folder: string) {}
  async cleanup() {}
}

export { Store }
