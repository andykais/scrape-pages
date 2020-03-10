import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
// type imports
import { Stream } from '@scrape-pages/types/internal'

/**
 * @name loop
 * @argument pipeTo an rxjs operation that typically creates many outputs for a single input
 * @argument iterateFn the result of this function is what is passed to the pipeTo operation
 * @description creates an infinite loop that waits until all the values from pipeTo stop before reaching the top of the loop
 *
 * note that this observable has no observer.complete(), it runs indefidently until either an error or an unsubscribe
 */
function loop(
  pipeTo: Stream.Operation,
  iterateFn: (index: number) => Stream.Payload
): Rx.Observable<Stream.Payload> {
  return new Rx.Observable(observer => {
    let subscribed = true
    let sourceSubscriber: Rx.Subscription | null = null
    observer.add(() => {
      subscribed = false
      if (sourceSubscriber) sourceSubscriber.unsubscribe()
    })
    ;(async () => {
      try {
        for (let index = 0; subscribed; index++) {
          const source = Rx.of(iterateFn(index)).pipe(pipeTo)

          await new Promise((resolve, reject) => {
            sourceSubscriber = source.subscribe({
              next(v) {
                observer.next(v)
              },
              error(error) {
                reject(error)
              },
              complete() {
                resolve()
              }
            })
          })
          sourceSubscriber = null
        }
      } catch (error) {
        observer.error(error)
      }
    })()
  })
}

export { loop }
