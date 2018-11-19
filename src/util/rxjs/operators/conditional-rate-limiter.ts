import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'

export type Task = () => Promise<any>
export interface Queue<T> {
  push: Function
  pop: (amountToPop: number) => T
}

/**
 * rate toggle purely for controlling the rate at which things are executed.
 * Usage: anything input will be ignored, but it will add to the number of things planned to be executed.
 * When appropriate, then the limiter will call the executor function. The executor does not know anything
 * about the items being inserted, so a queue is probably required on the other side.
 *
 */
const rateLimitToggle = <V>(
  {
    toggler,
    executor,
    timer
  }: {
    toggler: Rx.Observable<boolean>
    executor: () => Promise<any>
    timer?: typeof Rx.timer
  },
  {
    limit,
    rate,
    maxConcurrent,
    useLimiterFirst = true
  }: {
    limit: number
    rate: number
    maxConcurrent: number
    useLimiterFirst?: boolean
  }
) => {
  const rateTimer = Rx.timer(0, rate).pipe(ops.mapTo(true))
  return (source: Rx.Observable<any>) =>
    new Rx.Observable(subscriber => {
      const concurrentLimiter = new Rx.BehaviorSubject(false)

      // stateful vars
      let plannedExecutions = 0
      let inProgressExecutions = 0
      let closed = false

      const dequeue = (useRateLimit: boolean) => {
        const availableSlots = useRateLimit
          ? Math.min(limit, maxConcurrent - inProgressExecutions)
          : maxConcurrent - inProgressExecutions
        const numberToDequeue = Math.min(availableSlots, plannedExecutions)
        const nextVals = Array(numberToDequeue).fill(null)
        inProgressExecutions += numberToDequeue
        plannedExecutions -= numberToDequeue
        return nextVals
      }

      // async flow
      Rx.merge(Rx.of(useLimiterFirst), toggler)
        .pipe(
          ops.switchMap(
            useRateLimiter => (useRateLimiter ? rateTimer : concurrentLimiter)
          ),
          ops.takeWhile(() => !closed || !!plannedExecutions),
          ops.mergeMap(dequeue),
          ops.mergeMap(executor) // must manage the max concurrent number manually
        )
        .subscribe(val => {
          inProgressExecutions--
          concurrentLimiter.next(null)
          subscriber.next(val)
        })

      source.subscribe({
        next(val) {
          plannedExecutions++
          concurrentLimiter.next(null)
        },
        complete() {
          closed = true
        }
      })
    })
}

export { rateLimitToggle }
