import { RuntimeBase } from '@scrape-pages/runtime/runtime-base'

class Queue extends RuntimeBase {
  public constructor() {
    super('Queue')
  }

  public add = () => {
    throw new Error('unimplemented')
  }
  public toggleRateLimiter = () => {
    throw new Error('unimplemented')
  }

  /* RuntimeBase overrides */
  public async initialize() {}
  public async cleanup() {}
}

export { Queue }
