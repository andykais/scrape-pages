import EventEmitter from 'events'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { rateLimitToggle } from './util/rxjs/operators'
import { Parallelism } from './run-options/types'

type Task = () => Promise<any>
type ErrorCallback = (error: Error, value: any) => void
class Queuer {
  pending: number
  inProgress: number
  isOpen: boolean
  enqueueSubject: Rx.Subject<any>
  taskObservable: Rx.Observable<{}>
  queuePromise: Promise<any>

  constructor(
    { maxConcurrent = 1, rateLimit }: Parallelism,
    toggler: Rx.Observable<{}>
  ) {
    // rx subject that adds tasks to the observable pipeline
    const enqueueSubject = new Rx.Subject()

    // based on the run params the queue may use the conditional time-based rate limiter or a simple concurrent limiter
    const taskObservable = enqueueSubject.pipe(
      rateLimit
        ? rateLimitToggle(this._executeTask, toggler, {
            ...rateLimit,
            maxConcurrent
          })
        : ops.mergeMap(this._executeTask, maxConcurrent)
    )

    this.pending = 0
    this.inProgress = 0
    this.isOpen = true
    this.enqueueSubject = enqueueSubject
    this.taskObservable = taskObservable
    this.queuePromise = taskObservable.toPromise()
  }

  _executeTask = ([task, callback]: [Task, ErrorCallback]) => {
    console.log('executing')
    this.inProgress++
    return task()
      .then(value => callback(null, value))
      .catch(error => callback(error, null))
  }

  // returns a promise that resolves or rejects according to the promise passed in
  add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.isOpen) {
        this.pending++
        const callback: ErrorCallback = (error, value) => {
          this.inProgress--
          this.pending--
          if (error) reject(error)
          else resolve(value)
        }
        this.enqueueSubject.next([task, callback])
      } else {
        resolve()
      }
    })
  }

  // called add(task) anywhere after this method is called with do nothing
  closeQueue() {
    this.isOpen = false
    this.enqueueSubject.unsubscribe()
  }

  // queuePromise will never resolve until closeQueue() is called
  // if you are waiting on a promise that will never close, your program may exit unexpectedly
  // see https://stackoverflow.com/q/46966890/3795137 for an explaination of the nodejs event cycle
  toPromise() {
    return this.queuePromise
  }
}
export default Queuer
