import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'

const rateLimitToggle = <V>(
  func: (...args: V[]) => Promise<any>,
  toggler: Rx.Observable<any>,
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
  return (source: Rx.Observable<V>) =>
    new Rx.Observable(subscriber => {
      const concurrentLimiter = new Rx.BehaviorSubject(false)

      // stateful vars
      const queue: V[] = []
      let inProgress = 0
      let closed = false

      // queuing functions
      const enqueue = (val: V) => {
        queue.push(val)
        concurrentLimiter.next(null)
      }
      const dequeue = (useRateLimit: boolean) => {
        const availableSlots = useRateLimit
          ? Math.min(limit, maxConcurrent - inProgress)
          : maxConcurrent - inProgress
        const numberToDequeue = Math.min(availableSlots, queue.length)
        const nextVals = numberToDequeue ? queue.splice(0, numberToDequeue) : []
        inProgress += numberToDequeue
        return nextVals
      }

      // async flow
      Rx.merge(Rx.of(useLimiterFirst), toggler)
        .pipe(
          ops.mergeMap(
            useRateLimiter => (useRateLimiter ? rateTimer : concurrentLimiter)
          ),
          ops.takeWhile(() => !closed || Boolean(queue.length)),
          ops.mergeMap(dequeue),
          ops.mergeMap(val => func(val)) // must manage the max concurrent number manually
        )
        .subscribe(val => {
          inProgress--
          concurrentLimiter.next(null)
          subscriber.next(val)
        })

      source.subscribe({
        next(val) {
          enqueue(val)
        },
        complete() {
          closed = true
        }
      })
    })
}
export { rateLimitToggle }
