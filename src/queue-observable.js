import EventEmitter from 'events'
import { fromEvent } from 'rxjs'
import { tap, takeUntil, mergeMap } from 'rxjs/operators'

class Queuer {
  constructor({ maxConcurrent = 1, debug = false } = {}) {
    // node event emitter
    const queueEmitter = new EventEmitter()
    // event emitter to keep track of each task finishing
    const taskEmitter = new EventEmitter()

    const debugMsg = message => val =>
      debug && console.log(message, val, `${this.pending} pending`)

    // listen to `queueEmitter` for a stream of inputs
    const source = fromEvent(queueEmitter, 'promise').pipe(
      tap(debugMsg('ADD TASK')),
      // stop accepting new values after 'close' event is emitted
      takeUntil(fromEvent(queueEmitter, 'close')),
      // concurrently run 'maxConcurrent' promises together
      mergeMap(vals => this._executeTask(vals), maxConcurrent),
      tap(debugMsg('TASK COMPLETED'))
    )

    this.pending = 0
    this.queueEmitter = queueEmitter
    this.taskEmitter = taskEmitter
    this.source = source
    this.queuePromise = source.toPromise()
  }

  // does not affect the stream but notifies taskEmitter that this particular promise has completed
  _executeTask([task, unique]) {
    return task()
      .then(
        value => (this.taskEmitter.emit('complete', { unique, value }), value)
      )
      .catch(
        error => (this.taskEmitter.emit('complete', { error, unique }), error)
      )
  }

  // returns a promise that resolves or rejects according to the promise passed in
  // <T>(task: () => Promise<T>): Promise<T>
  add(task) {
    return new Promise((resolve, reject) => {
      const uniqueId = Symbol()
      this.pending++
      this.queueEmitter.emit('promise', task, uniqueId)
      this.taskEmitter.on('complete', ({ error, unique, value }) => {
        if (uniqueId === unique) {
          this.pending--
          if (error) reject(error)
          else resolve(value)
        }
      })
    })
  }

  // called add(task) anywhere after this method is called with do nothing
  closeQueue() {
    this.queueEmitter.emit('close')
  }

  // queuePromise will never resolve until closeQueue() is called
  // if you are waiting on a promise that will never close, your program may exit unexpectedly
  // see https://stackoverflow.com/q/46966890/3795137 for an explaination of the nodejs event cycle
  toPromise() {
    return this.queuePromise
  }
}
export default Queuer
