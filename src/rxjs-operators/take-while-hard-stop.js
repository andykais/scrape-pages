import * as Rx from 'rxjs'

export default predicate => source =>
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
      complete() {
        destination.complete()
      }
    })
  })
