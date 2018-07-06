import EventEmitter from 'events'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { rateLimitToggle } from './util/rxjs-operators'

class Queuer {
  constructor({ maxConcurrent = 1, limiter, debug = false }, toggler) {
    // node event emitter
    const queueEmitter = new EventEmitter()
    // event emitter to keep track of each task finishing

    const debugMsg = message => val =>
      debug && console.log(message, val, `${this.pending} pending`)

    // based on the run options it may use the conditional rate limiter or a simple concurrent limiter
    const concurrentController = limiter
      ? rateLimitToggle(
          this._executeTask,
          limiter.limit,
          limiter.rate,
          maxConcurrent,
          toggler
        )
      : mergeMap(this._executeTask, maxConcurrent)

    // listen to `queueEmitter` for a stream of inputs
    const source = Rx.fromEvent(queueEmitter, 'task').pipe(
      ops.tap(debugMsg('ADD TASK')),
      // stop accepting new values after 'close' event is emitted
      ops.takeUntil(Rx.fromEvent(queueEmitter, 'close')),
      concurrentController,
      ops.tap(debugMsg('TASK COMPLETED'))
    )

    this.pending = 0
    this.inProgress = 0
    this.queueEmitter = queueEmitter
    this.source = source
    this.queuePromise = source.toPromise()
  }

  _executeTask = ([task, callback]) => {
    this.inProgress++
    return task()
      .then(value => callback(null, value))
      .catch(error => callback(error))
  }

  // returns a promise that resolves or rejects according to the promise passed in
  // <T>(task: () => Promise<T>): Promise<T>
  add(task) {
    return new Promise((resolve, reject) => {
      this.pending++
      this.queueEmitter.emit('task', task, (error, value) => {
        this.inProgress--
        if (error) reject(error)
        else resolve(value)
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
