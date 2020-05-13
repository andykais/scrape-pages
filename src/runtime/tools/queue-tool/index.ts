import { EventEmitter } from 'events'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { RuntimeBase } from '@scrape-pages/runtime/runtime-base'
import { PriorityQueue } from './priority-queue'
// type imports
import { Settings } from '@scrape-pages/types/internal'
import { RateLimit } from '@scrape-pages/types/options'

// allowing observables makes testing easier
type PromiseLike<T> = Promise<T> | Rx.Observable<T>
type Task<T> = () => PromiseLike<T>
class Queue extends RuntimeBase {
  public scheduler: Rx.Observable<void>
  private settings: Settings
  private updateRateSubject: Rx.BehaviorSubject<RateLimit>
  private enqueueSubject: Rx.Subject<null>
  private pQueue: PriorityQueue<Task<any>>
  private tasksInProgress: number
  private maxConcurrent: number | undefined
  private throttleMs: number | undefined

  public constructor(settings: Settings) {
    super('Queue')
    this.settings = settings

    const { rate = {} } = settings.options.FETCH || {}
    this.maxConcurrent = rate.maxConcurrent
    this.throttleMs = rate.throttleMs

    this.tasksInProgress = 0
    this.pQueue = new PriorityQueue<Task<void>>()
    this.enqueueSubject = new Rx.Subject()
    this.updateRateSubject = new Rx.BehaviorSubject(rate)
    this.scheduler = this.updateRateSubject.pipe(
      ops.switchMap(rate => (rate.throttleMs ? Rx.timer(0, rate.throttleMs) : this.enqueueSubject)),
      ops.filter(this.shouldScheduleTask),
      ops.map(this.grabTask),
      ops.flatMap(task => task()),
      ops.tap(v => {
        this.tasksInProgress--
        this.enqueueSubject.next()
      })
    )
  }

  public push = <T>(task: Task<T>, priority: number): Promise<T> => {
    return new Promise((resolve, reject) => {
      const wrappedTask = () => {
        const activeTask = task()
        if (activeTask instanceof Promise) return activeTask.then(resolve).catch(reject)
        else {
          return activeTask.pipe(
            ops.tap(resolve),
            ops.catchError(e => {
              reject(e)
              return Rx.of(null)
            })
          )
        }
      }

      this.pQueue.push(wrappedTask, priority)
      this.enqueueSubject.next()
    })
  }

  public updateRateLimit = (rate: RateLimit) => {
    this.updateRateSubject.next(rate)
    this.maxConcurrent = rate.maxConcurrent
    this.throttleMs = rate.throttleMs
  }

  public get size() {
    return this.pQueue.length
  }

  private grabTask = (): Task<any> => {
    const task = this.pQueue.pop()
    if (!task) throw new Error('A task was expected, but the priority queue was empty.')
    this.tasksInProgress++
    return task
  }

  private shouldScheduleTask = (): boolean => {
    if (this.maxConcurrent && this.maxConcurrent <= this.tasksInProgress) return false
    if (this.size === 0) return false
    return true
  }
}

export {
  Queue,
  // type exports
  Task
}
