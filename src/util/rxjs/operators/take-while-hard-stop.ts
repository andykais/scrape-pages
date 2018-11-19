import * as Rx from 'rxjs'

const takeWhileHardStop = <T>(
  predicate: (value: T, index: number) => boolean
) => (source: Rx.Observable<T>) =>
  new Rx.Observable(destination => {
    let index = 0
    const subscription = source.subscribe({
      next(value) {
        if (predicate(value, index)) {
          destination.next(value)
        } else {
          destination.complete()
          subscription.unsubscribe()
        }
        index++
      },
      error(error) {
        destination.error(error)
      },
      complete() {
        destination.complete()
      }
    })
  })
export { takeWhileHardStop }
