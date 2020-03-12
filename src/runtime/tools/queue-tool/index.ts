import { RuntimeBase } from '@scrape-pages/runtime/runtime-base'

type Task<T> = () => Promise<T>
class Queue extends RuntimeBase {
  public constructor() {
    super('Queue')
  }

  public enqueue = <T>(task: Task<T>): Promise<T> => {
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
