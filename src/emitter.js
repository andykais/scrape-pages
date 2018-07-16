import EventEmitter from 'events'
import * as Rx from 'rxjs'
import { makeFlatConfig } from './configuration/make-flat-config'

class ScrapeEmitter {
  forScraper = {}

  constructor(config) {
    this._emitter = new EventEmitter()
    const flatConfig = makeFlatConfig(config)
    for (const name of Object.keys(flatConfig)) {
      this.forScraper[name] = {
        emitQueuedDownload: id => {
          this.emitter.emit(`${name}:queued`, id)
        },
        emitProgress: (id, progress) => {
          this.emitter.emit(`${name}:progress`, id, progress)
        },
        emitCompletedDownload: id => {
          this.emitter.emit(`${name}:complete`, id)
        }
      }
    }
  }

  hasListenerFor(eventName) {
    return Boolean(this.emitter.listenerCount(eventName))
  }

  emitDone(queryFor) {
    this.emitter.emit('done', queryFor)
  }

  emitError(error) {
    this.emitter.emit('error', error)
  }

  get emitter() {
    return this._emitter
  }

  get toggler() {
    return Rx.fromEvent(this.emitter, 'useRateLimiter')
  }
}
export default ScrapeEmitter
