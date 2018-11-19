import EventEmitter from 'events'
import * as Rx from 'rxjs'
import { makeFlatConfig } from './configuration/site-traversal/make-flat-config'
import { Config } from './configuration/site-traversal/types'

class ScrapeEmitter {
  private _emitter: EventEmitter
  private store: any

  forScraper: {
    [name: string]: {
      emitQueuedDownload: (id: number) => void
      emitProgress: (id: number, progress: number) => void
      emitCompletedDownload: (id: number) => void
    }
  } = {}

  constructor(config: Config, store: any) {
    // TODO replace w/ store.queryFor
    this._emitter = new EventEmitter()
    this.store = store

    const flatConfig = makeFlatConfig(config)
    for (const name of Object.keys(flatConfig)) {
      this.forScraper[name] = {
        emitQueuedDownload: id => {
          this.emitter.emit(`${name}:queued`, this.store.queryFor, { id })
          this.emitter.emit('queued', this.store.queryFor, { name, id })
        },
        emitProgress: (id, progress) => {
          this.emitter.emit(`${name}:progress`, this.store.queryFor, {
            id,
            progress
          })
        },
        emitCompletedDownload: id => {
          this.emitter.emit(`${name}:complete`, this.store.queryFor, { id })
          this.emitter.emit('complete', this.store.queryFor, { name, id })
        }
      }
    }
  }

  hasListenerFor(eventName: string) {
    return Boolean(this.emitter.listenerCount(eventName))
  }

  emitDone() {
    this.emitter.emit('done', this.store.queryFor)
  }

  emitError(error: Error) {
    this.emitter.emit('error', error)
  }

  get emitter() {
    return this._emitter
  }

  getRxEventStream = (eventName: string) =>
    Rx.fromEvent(this.emitter, eventName)

  onStop(cb: () => any) {
    this.emitter.on('stop', cb)
  }
}
export default ScrapeEmitter
