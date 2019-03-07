import * as ops from 'rxjs/operators'
import { Emitter } from './emitter'
import { Store } from './store'
import { Logger } from './logger'
import { Queue } from './queue'

// type imports
import { Settings } from '../settings'

export type Tools = {
  store: Store
  emitter: Emitter
  logger: Logger
  queue: Queue
}
export const initTools = (settings: Settings): Tools => {
  const store = new Store(settings)
  const emitter = new Emitter(settings)
  const logger = new Logger(settings)
  const rateLimiterEventStream = emitter
    .getRxEventStream(Emitter.emittable.USE_RATE_LIMITER)
    .pipe(ops.map(toggle => !!toggle))
  const queue = new Queue(settings, rateLimiterEventStream)

  return {
    store,
    emitter,
    logger,
    queue
  }
}

export const initStore = (settings: Settings): Store => {
  return new Store(settings)
}
