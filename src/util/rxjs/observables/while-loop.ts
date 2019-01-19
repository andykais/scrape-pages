import * as Rx from 'rxjs'

export const whileLoopObservable = <In, Out>(
  inLoopFunction: (initialVal: In, index: number) => Promise<Out>,
  conditional: (loopValue: Out, index: number) => boolean,
  initialVal: In
): Rx.Observable<Out> =>
  new Rx.Observable(observer => {
    ;(async () => {
      // stateful vars
      let nextVal: Out,
        index = 0

      do {
        try {
          nextVal = await inLoopFunction(initialVal, index)
          observer.next(nextVal)
          index++
        } catch (e) {
          observer.error(e)
          break
        }
      } while (conditional(nextVal, index))
      observer.complete()
    })()
  })
