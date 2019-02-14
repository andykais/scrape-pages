import * as ops from 'rxjs/operators'
import { Emitter } from './emitter'
import { Store } from './store'
import { Logger } from './logger'
import { Queue } from './queue'

// type imports
import { Config } from '../settings/config/types'
import { OptionsInit, FlatOptions } from '../settings/options/types'

export type Tools = {
  store: Store
  emitter: Emitter
  logger: Logger
  queue: Queue
}
export const initTools = (
  config: Config,
  optionsInit: OptionsInit,
  flatOptions: FlatOptions
): Tools => {
  const store = new Store(config, optionsInit)
  const emitter = new Emitter(config)
  const logger = new Logger(optionsInit, flatOptions)
  const rateLimiterEventStream = emitter
    .getRxEventStream('useRateLimiter')
    .pipe(ops.map(toggle => !!toggle))
  const queue = new Queue(optionsInit, flatOptions, rateLimiterEventStream)

  return {
    store,
    emitter,
    logger,
    queue
  }
}
