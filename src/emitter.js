import EventEmitter from 'events'

class ScrapeEmitter {
  constructor() {
    this.limiters = []
    this.emitter = new EventEmitter()
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

  get emitter() {
    return this.emitter
  }
}
