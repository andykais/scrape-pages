import { EventEmitter } from 'events'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
// type imports
import { FMap } from '../util/map'
import { Settings } from '../settings'
import { ScraperName } from '../settings/config/types'

type DownloadInfo = { id: number; filename?: string; mimeType?: string; byteLength?: number }

class ScraperEmitter {
  public stopRequested: boolean = false
  public constructor(private scraperName: string, private emitter: EventEmitter) {}

  public listenerCount(event: 'queued' | 'progress' | 'complete') {
    return this.emitter.listenerCount(event)
  }

  public emit(event: 'queued', downloadId: number): boolean
  public emit(event: 'progress', downloadId: number, progress: number): boolean
  public emit(event: 'complete', downloadInfo: DownloadInfo): boolean
  public emit(event: string, ...args: any[]): boolean {
    return this.emitter.emit(`${this.scraperName}:${event}`, ...args)
  }

  public on(event: 'stop', listener: () => void): this
  public on(event: string, listener: (...args: any[]) => void) {
    if (event === 'stop') {
      this.emitter.on(`${event}:${this.scraperName}`, () => (this.stopRequested = true))
    } else this.emitter.on(`${event}:${this.scraperName}`, listener)
    return this
  }
}

class Emitter {
  private emitter: EventEmitter
  private scrapers: FMap<string, ScraperEmitter>

  public constructor({ flatConfig }: Settings) {
    this.emitter = new EventEmitter()
    this.emitter.on = this.emitter.on.bind(this.emitter)
    this.emitter.emit = this.emitter.emit.bind(this.emitter)
    this.scrapers = flatConfig.map((_, name) => new ScraperEmitter(name, this.emitter))
  }

  // get different emitters
  public scraper = (scraper: string) => this.scrapers.getOrThrow(scraper)
  public getBaseEmitter = () => this.emitter
  public getRxEventStream(eventName: 'stop' | 'useRateLimiter') {
    return Rx.fromEvent(this.emitter, eventName).pipe(ops.map(Boolean))
  }

  public emit(event: 'done'): boolean
  public emit(event: 'error', error: Error): boolean
  public emit(event: string | symbol, ...args: any[]) {
    return this.emitter.emit(event, ...args)
  }

  public on(event: 'stop', listener: () => void): this
  public on(event: string | symbol, listener: (...args: any[]) => void) {
    this.emitter.on(event, listener)
    return this
  }
}

export { Emitter }
