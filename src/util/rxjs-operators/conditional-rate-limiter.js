import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'

const rateLimitToggle = (func, limit, rate, maxConcurrent, toggler) => {
  const rateTimer = Rx.timer(0, rate).pipe(ops.mapTo(true))
  return source =>
    new Rx.Observable(subscriber => {
      const concurrentLimiter = new Rx.Subject()
      // stateful vars
      const queue = []
      let inProgress = 0
      let closed = false

      const enqueue = val => {
        queue.push(val)
        concurrentLimiter.next()
      }
      const dequeue = useRateLimit => {
        const availableSlots = useRateLimit ? limit : maxConcurrent - inProgress
        const numberToDequeue = Math.min(availableSlots, queue.length)
        const nextVals = queue.splice(0, numberToDequeue)
        inProgress += availableSlots
        return nextVals
      }

      Rx.merge(Rx.of(true), toggler)
        .pipe(
          ops.switchMap(
            useRateLimiter => (useRateLimiter ? rateTimer : concurrentLimiter)
          ),
          ops.takeWhile(() => !closed || queue.length),
          ops.mergeMap(dequeue),
          ops.mergeMap(val => func(val), maxConcurrent)
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
