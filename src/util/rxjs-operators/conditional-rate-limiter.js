import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'

const rateLimitToggle = (
  func,
  toggler,
  { limit, rate, maxConcurrent, useLimiterFirst = true }
) => {
  const rateTimer = Rx.timer(0, rate).pipe(ops.mapTo(true))
  return source =>
    new Rx.Observable(subscriber => {
      const concurrentLimiter = new Rx.BehaviorSubject(false)
      // stateful vars
      const queue = []
      let inProgress = 0
      let closed = false

      const enqueue = val => {
        queue.push(val)
        concurrentLimiter.next()
      }
      const dequeue = useRateLimit => {
        const availableSlots = useRateLimit
          ? Math.min(limit, maxConcurrent - inProgress)
          : maxConcurrent - inProgress
        const numberToDequeue = Math.min(availableSlots, queue.length)
        const nextVals = numberToDequeue ? queue.splice(0, numberToDequeue) : []
        inProgress += numberToDequeue
        return nextVals
      }

      Rx.merge(Rx.of(useLimiterFirst), toggler)
        .pipe(
          ops.mergeMap(
            useRateLimiter => (useRateLimiter ? rateTimer : concurrentLimiter)
          ),
          ops.takeWhile(() => !closed || queue.length),
          ops.mergeMap(dequeue),
          ops.mergeMap(val => func(val)) // must manage the max concurrent number manually
        )
        .subscribe(val => {
          inProgress--
          concurrentLimiter.next()
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
