import EventEmitter from 'events'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { rateLimitToggle } from '../util/rxjs/operators'
import {
  RunOptionsInit,
  FlatRunOptions
} from '../configuration/run-options/types'
import { PriorityQueue } from './priority-queue'
import { Task } from '../util/rxjs/operators/conditional-rate-limiter'

type ErrorCallback = (error?: Error, value?: any) => void
class Queue {
  private isOpen: boolean
  private enqueueSubject: Rx.Subject<any>
  // private taskObservable: Rx.Observable<{}>
  private queuePromise: Promise<any>
  private queue: PriorityQueue<Task>

  constructor(
    { maxConcurrent = 1, rateLimit }: RunOptionsInit,
    flatRunOptions: FlatRunOptions,
    toggler: Rx.Observable<boolean>
  ) {
    const priorities = Object.values(flatRunOptions).map(
      options => options.downloadPriority
    )
    this.queue = new PriorityQueue(Array.from(new Set(priorities)))

    // rx subject that adds tasks to the observable pipeline
    const enqueueSubject = new Rx.Subject()

    // based on the run params the queue may use the conditional time-based rate limiter or a simple concurrent limiter
    const taskObservable = enqueueSubject.pipe(
      rateLimit
        ? rateLimitToggle(
            {
              executor: this.executor,
              toggler
            },
            {
              ...rateLimit,
              maxConcurrent
            }
          )
        : ops.mergeMap(this.executor, maxConcurrent)
    )

    this.isOpen = true
    this.enqueueSubject = enqueueSubject
    this.queuePromise = taskObservable.toPromise()
  }

  private executor = <T>(): Promise<T> => {
    const taskWithCallback = this.queue.pop()
    if (!taskWithCallback) {
      throw new TypeError('queue popped an undefined task.')
    }
    return taskWithCallback()
  }

  private wrapTask = (task: Task, callback: ErrorCallback): Task => () =>
    task()
      .then(value => callback(undefined, value))
      .catch(error => callback(error, undefined))

  // returns a promise that resolves or rejects according to the promise passed in
  add = <T>(task: () => Promise<T>, priority: number): Promise<T> => {
    return new Promise((resolve, reject) => {
      const callback: ErrorCallback = (error, value) => {
        if (error) reject(error)
        else resolve(value)
      }
      this.queue.push(this.wrapTask(task, callback), priority)
      this.enqueueSubject.next(null)
    })
  }

  // called add(task) anywhere after this method is called will throw an error
  closeQueue() {
    this.isOpen = false
    this.enqueueSubject.complete()
  }

  // queuePromise will never resolve until closeQueue() is called
  // if you are waiting on a promise that will never close, your program may exit unexpectedly
  // see https://stackoverflow.com/q/46966890/3795137 for an explaination of the nodejs event cycle
  toPromise() {
    return this.queuePromise
  }
}
export { Queue }
