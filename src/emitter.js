import EventEmitter from 'events'
import * as Rx from 'rxjs'

class ScrapeEmitter {
  constructor() {
    this.limiters = []
    this._emitter = new EventEmitter()
    this.emitter.on('limit', this.setLimitersTo)
  }

  registerLimiter(setLimiterFunc) {
    this.limiters.push(setLimiterFunc)
  }

  // val: 'on' | 'off' | 'default'
  setLimitersTo(val) {
    this.limiters.forEach(func => func(val))
  }

  emitStoreWrite(db) {
    this.emitter.emit('storeChange', db)
  }

  emitTotalQueuedChanged(queuedTotals) {
    this.emitter.emit('queued', queuedTotals)
  }

  emitFileProgress(id, progress) {
    this.emitter.emit('progress', id, progress)
  }

  emitDone() {
    this.emitter.emit('done')
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
