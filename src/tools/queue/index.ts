import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { rateLimitToggle } from '../../util/rxjs/operators'
import { PriorityQueue } from './priority-queue'
// type imports
import { Task } from '../../util/rxjs/operators/conditional-rate-limiter'
import { Settings } from '../../settings'

type ErrorCallback = (error?: Error, value?: any) => void
class Queue {
  private isOpen: boolean
  private enqueueSubject: Rx.Subject<any>
  // private taskObservable: Rx.Observable<{}>
  private queuePromise: Promise<any>
  private queue: PriorityQueue<Task>

  public constructor({ optionsInit, flatOptions }: Settings, toggler: Rx.Observable<boolean>) {
    const { maxConcurrent = 1, rateLimit } = optionsInit

    const priorities = new Set([...flatOptions.values()].map(options => options.downloadPriority))
    this.queue = new PriorityQueue(Array.from(priorities))

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

  // returns a promise that resolves or rejects according to the promise passed in
  public add = <T>(task: () => Promise<T>, priority: number): Promise<T> => {
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
  public closeQueue() {
    this.isOpen = false
    this.enqueueSubject.complete()
  }

  // queuePromise will never resolve until closeQueue() is called
  // if you are waiting on a promise that will never close, your program may exit unexpectedly
  // see https://stackoverflow.com/q/46966890/3795137 for an explaination of the nodejs event cycle
  public toPromise() {
    return this.queuePromise
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
}
export { Queue }
