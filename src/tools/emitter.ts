import { EventEmitter } from 'events'
import * as Rx from 'rxjs'
import * as Fetch from 'node-fetch'
// type imports
import { FMap } from '../util/map'
import { Settings } from '../settings'
import { ScraperName } from '../settings/config/types'

class ScraperEmitter {
  /** listenable by user */
  static listenable = {
    QUEUED: 'queued',
    PROGRESS: 'progress',
    COMPLETE: 'complete'
  }
  /** emittable by user */
  static emittable = {
    STOP: 'done'
  }
  public emit = {
    queued: (id: number) => {
      this.emitter.emit(`${this.name}:${ScraperEmitter.listenable.QUEUED}`, id)
    },
    progress: (id: number, response: Fetch.Response) => {
      const emitKey = `${this.name}:${ScraperEmitter.listenable.PROGRESS}`
      if (this.emitter.listenerCount(emitKey)) {
        const contentLength = parseInt(response.headers.get('content-length') || '0')
        let bytesLength = 0
        response.body.on('data', chunk => {
          bytesLength += chunk.length
          // emitting Infinity signals that content-length was zero
          const progress = bytesLength / contentLength
          this.emitter.emit(emitKey, id, progress)
        })
      }
    },
    completed: (id: number) => {
      this.emitter.emit(`${this.name}:${ScraperEmitter.listenable.COMPLETE}`, id)
    }
  }
  public on = {
    stop: (callback: () => void) => {
      this.emitter.on(`${this.name}:${ScraperEmitter.emittable.STOP}`, callback)
    }
  }
  private emitter: EventEmitter
  private name: string

  public constructor(name: string, emitter: EventEmitter) {
    this.emitter = emitter
    this.name = name
  }
}

type EmitterOn = (event: string, callback: (...args: any[]) => void) => void
type EmitterEmit = (event: 'stop' | 'useRateLimiter', ...emittedValues: any[]) => void

class Emitter {
  /** listenable by user */
  static listenable = {
    DONE: 'done',
    ERROR: 'error'
  }
  /** emittable by user */
  static emittable = {
    STOP: 'stop',
    USE_RATE_LIMITER: 'useRateLimiter'
  }
  public emitter: EventEmitter

  /** used internally (verbs are reversed) */
  public emit = {
    done: () => {
      this.emitter.emit(Emitter.listenable.DONE)
    },
    error: (error: Error) => {
      this.emitter.emit(Emitter.listenable.ERROR, error)
    }
  }
  /** used internally (verbs are reversed) */
  public on = {
    stop: (callback: () => void) => {
      this.emitter.on(Emitter.emittable.STOP, callback)
    }
  }
  private scrapers: FMap<ScraperName, ScraperEmitter>

  public constructor({ flatConfig }: Settings) {
    this.emitter = new EventEmitter()

    this.scrapers = flatConfig.map((_, name) => new ScraperEmitter(name, this.emitter))
  }
  public scraper = (name: ScraperName) => this.scrapers.getOrThrow(name)
  public getBoundOn = (): EmitterOn => this.emitter.on.bind(this.emitter)
  public getBoundEmit = (): EmitterEmit => this.emitter.emit.bind(this.emitter)
  public getRxEventStream = (eventName: string) => Rx.fromEvent(this.emitter, eventName)

  private hasListenerFor = (eventName: string): boolean =>
    this.emitter.listenerCount(eventName) !== 0
}
export { Emitter }
