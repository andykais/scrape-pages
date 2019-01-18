import EventEmitter from 'events'
import * as Rx from 'rxjs'
import * as Fetch from 'node-fetch'
import VError from 'verror'
// type imports
import { makeFlatConfig } from '../settings/config/make-flat-config'
import { Config } from '../settings/config/types'
import { Store } from './store'

const scraperEvents = {
  DOWNLOAD: 'download',
  PROGRESS: 'progress',
  COMPLETE: 'complete'
}

class ScraperEmitter {
  private emitter: EventEmitter
  private store: Store
  private name: string

  constructor(name: string, emitter: EventEmitter, store: Store) {
    this.emitter = emitter
    this.store = store
    this.name = name
  }
  public emitQueuedDownload = (id: number) => {
    this.emitter.emit(`${this.name}:queued`, this.store.queryFor, id)
  }
  public emitProgress = (id: number, response: Fetch.Response) => {
    const emitKey = `${this.name}:progress`
    if (this.emitter.listenerCount(emitKey)) {
      const contentLength = parseInt(
        response.headers.get('content-length') || '0'
      )
      let bytesLength = 0
      response.body.on('data', chunk => {
        bytesLength += chunk.length
        const progress = bytesLength / contentLength
        this.emitter.emit(emitKey, progress, id)
      })
    }
  }
  public emitCompletedDownload = (id: number) => {
    this.emitter.emit(`${this.name}:complete`, this.store.queryFor, id)
  }
}

const events = {
  // listenable
  DONE: 'done',
  ERROR: 'error',
  // emittable
  STOP: 'stop',
  USE_RATE_LIMITER: 'useRateLimiter'
}
type EmitterOn = (
  event: 'done' | 'error',
  callback: (...args: any[]) => void
) => void
type EmitterEmit = (
  event: 'stop' | 'useRateLimiter',
  ...emittedValues: any[]
) => void

class Emitter {
  private store: Store
  public emitter: EventEmitter
  public scraper: { [scraper: string]: ScraperEmitter } = {}

  public constructor(config: Config, store: Store) {
    // TODO replace w/ store.queryFor
    this.emitter = new EventEmitter()
    this.store = store

    const flatConfig = makeFlatConfig(config)
    for (const name of Object.keys(flatConfig)) {
      this.scraper[name] = new ScraperEmitter(name, this.emitter, this.store)
    }
  }

  private hasListenerFor = (eventName: string): boolean => {
    console.log(eventName, this.emitter.listenerCount(eventName))
    console.log(this.emitter.listenerCount(eventName) !== 0)
    return this.emitter.listenerCount(eventName) !== 0
  }

  emit = {
    done: () => {
      this.emitter.emit(events.DONE, this.store.queryFor)
    },
    error: (error: Error) => {
      this.emitter.emit(events.ERROR, error)
    }
  }
  on = {
    stop: (callback: () => void) => {
      this.emitter.on(events.STOP, callback)
    }
  }

  getBoundOn = (): EmitterOn => this.emitter.on.bind(this.emitter)
  getBoundEmit = (): EmitterEmit => this.emitter.emit.bind(this.emitter)

  emitDone() {
    this.emitter.emit('done', this.store.queryFor)
  }

  emitError(error: string) {
    if (this.emitter.listenerCount('error')) {
      this.emitter.emit('error', error)
    } else {
      // throw error
    }
  }

  getRxEventStream = (eventName: string) =>
    Rx.fromEvent(this.emitter, eventName)

  onStop(cb: () => any) {
    this.emitter.on('stop', cb)
  }
}
export { Emitter }
