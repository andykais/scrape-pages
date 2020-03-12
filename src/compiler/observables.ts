import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
// type imports
import { Stream } from '@scrape-pages/types/internal'

const SENSIBLE_MAX_EMPTY_LOOPS = 100

/**
 * @name loop
 * @argument pipeTo an rxjs operation that typically creates many outputs for a single input
 * @argument iterateFn the result of this function is what is passed to the pipeTo operation
 * @description creates an infinite loop that waits until all the values from pipeTo stop before reaching the top of the loop
 *
 * note that this observable has no observer.complete(), it runs indefidently until either an error or an unsubscribe
 * also note, if the pipeTo function does not return anything (e.g. PARSE '') then this loop will run indefinitely, and very fast.
 */
// can I use exhaustMap here???
function loop(
  pipeTo: Stream.Operation,
  iterateFn: (index: number) => Stream.Payload
): Rx.Observable<Stream.Payload> {
  return new Rx.Observable(observer => {
    let subscribed = true
    let sourceSubscriber: Rx.Subscription | null = null
    let consecutiveEmtpyPipes = 0
    observer.add(() => {
      subscribed = false
      if (sourceSubscriber) sourceSubscriber.unsubscribe()
    })
    ;(async () => {
      try {
        let calledNext = false
        for (let index = 0; subscribed; index++) {
          const source = Rx.of(iterateFn(index)).pipe(pipeTo)

          await new Promise((resolve, reject) => {
            sourceSubscriber = source.subscribe({
              next(v) {
                console.log('next please')
                observer.next(v)
                calledNext = true
              },
              error(error) {
                reject(error)
              },
              complete() {
                console.log('complete please')
                if (!calledNext) consecutiveEmtpyPipes++
                else consecutiveEmtpyPipes = 0
                if (consecutiveEmtpyPipes > SENSIBLE_MAX_EMPTY_LOOPS)
                  throw new Error(
                    `.loop() made ${SENSIBLE_MAX_EMPTY_LOOPS} iterations with no output. Consider refactoring the loop to contain some output.`
                  )
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

/**
 * @name any
 * @argument observables observables that will be waited on.
 * @description this functions a lot like merge except that the observable it creates completes after the first observable completes. It is analogous to Promise.any
 */
function any(...observables: Rx.Observable<any>[]) {
  return new Rx.Observable(observer => {
    if (observables.length === 0) {
      observer.complete()
    } else {
      for (const observable of observables) {
        observable.subscribe(observer)
      }
    }
  })
}

export { loop, any }
