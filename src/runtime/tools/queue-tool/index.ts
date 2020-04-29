import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { RuntimeBase } from '@scrape-pages/runtime/runtime-base'
import { PriorityQueue } from './priority-queue'
// type imports
import { Settings } from '@scrape-pages/types/internal'

type Task<T> = () => Promise<T>
class Queue extends RuntimeBase {
  public scheduler: Rx.Observable<void>
  private settings: Settings
  private useRateLimit: boolean
  private enqueueSubject: Rx.Subject<null>
  private toggleRateLimiterSubject: Rx.BehaviorSubject<boolean>
  private pQueue: PriorityQueue<Task<any>>
  private rate: { interval: number; limit: number } | undefined
  private maxConcurrency: number | undefined
  private tasksInProgress: number

  public constructor(settings: Settings) {
    super('Queue')
    this.settings = settings

    this.rate = this.settings.options.FETCH && this.settings.options.FETCH.rateLimit
    this.maxConcurrency = this.settings.options.FETCH && this.settings.options.FETCH.maxConcurrency
    this.useRateLimit = Boolean(this.rate)
    this.tasksInProgress = 0

    this.pQueue = new PriorityQueue<Task<void>>()
    this.enqueueSubject = new Rx.Subject()
    this.toggleRateLimiterSubject = new Rx.BehaviorSubject(this.useRateLimit)
    const rateInterval = this.rate ? Rx.timer(0, this.rate.interval) : Rx.empty()

    this.scheduler = this.toggleRateLimiterSubject.pipe(
      ops.switchMap(toggleOn => (toggleOn ? rateInterval : this.enqueueSubject)),
      ops.flatMap(() => Rx.range(this.getNumToDequeue())),
      ops.tap(() => this.tasksInProgress++),
      ops.map(() => this.pQueue.pop()!),
      ops.flatMap(task => task()),
      ops.tap(() => this.tasksInProgress--),
      ops.tap(() => this.enqueueSubject.next())
    )
  }

  public push = <T>(task: Task<T>, priority: number): Promise<T> => {
    return new Promise((resolve, reject) => {
      const wrappedTask = () =>
        task()
          .then(resolve)
          .catch(reject)

      this.pQueue.push(wrappedTask, priority)
      this.enqueueSubject.next()
    })
  }

  public toggleRateLimiter = (toggleOn: boolean) => {
    if (this.settings.options.FETCH && this.settings.options.FETCH.rateLimit && toggleOn) {
      this.useRateLimit = true
    } else {
      this.useRateLimit = false
    }
  }

  /* RuntimeBase overrides */
  public async initialize() {}
  public cleanup() {}

  private getNumToDequeue() {
    if (this.maxConcurrency && this.rate) {
      const allocationsForTasks = this.useRateLimit
        ? Math.min(this.rate!.limit, this.maxConcurrency - this.tasksInProgress)
        : this.maxConcurrency - this.tasksInProgress

      return Math.min(allocationsForTasks, this.pQueue.length)
    } else if (this.maxConcurrency) {
      const allocationsForTasks = this.maxConcurrency - this.tasksInProgress
      return Math.min(allocationsForTasks, this.pQueue.length)
    } else if (this.rate) {
      const allocationsForTasks = this.rate.limit
      return Math.min(allocationsForTasks, this.pQueue.length)
    } else {
      return this.pQueue.length
    }
  }
}

export { Queue }
