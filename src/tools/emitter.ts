import { EventEmitter } from 'events'
import * as Rx from 'rxjs'
import * as Fetch from 'node-fetch'
// type imports
import { FMap } from '../util/map'
import { Settings } from '../settings'
import { ScraperName } from '../settings/config/types'

const scraperEvents = {
  QUEUED: 'queued',
  PROGRESS: 'progress',
  COMPLETE: 'complete'
}

class ScraperEmitter {
  public emit = {
    queued: (id: number) => {
      this.emitter.emit(`${this.name}:${scraperEvents.QUEUED}`, id)
    },
    progress: (id: number, response: Fetch.Response) => {
      const emitKey = `${this.name}:${scraperEvents.PROGRESS}`
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
      this.emitter.emit(`${this.name}:${scraperEvents.COMPLETE}`, id)
    }
  }
  private emitter: EventEmitter
  private name: string

  public constructor(name: string, emitter: EventEmitter) {
    this.emitter = emitter
    this.name = name
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
type EmitterOn = (event: string, callback: (...args: any[]) => void) => void
type EmitterEmit = (event: 'stop' | 'useRateLimiter', ...emittedValues: any[]) => void

class Emitter {
  public emitter: EventEmitter

  public emit = {
    done: () => {
      this.emitter.emit(events.DONE)
    },
    error: (error: Error) => {
      this.emitter.emit(events.ERROR, error)
    }
  }
  public on = {
    stop: (callback: () => void) => {
      this.emitter.on(events.STOP, callback)
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
