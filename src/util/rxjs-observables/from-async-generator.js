import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'

const fromAsyncGenerator = generator =>
  new Rx.Observable(async destination => {
    try {
      for await (const value of generator()) {
        destination.next(value)
        if (destination.closed) break
      }
      destination.complete()
    } catch (e) {
      destination.error(e)
    }
  })

export { fromAsyncGenerator }
