import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
// types
import { DownloadParseFunction } from '../../../scraper/scrape-step/incrementer'

const asyncLoop = async <In, Out>(
  initialVal: In,
  inLoopFunction: (initialVal: In, index: number) => Promise<Out>,
  conditional: (loopValue: Out, index: number) => boolean,
  observer: Rx.Observer<Out>
) => {
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
    }
  } while (conditional(nextVal, index))
  observer.complete()
}

export const whileLoopObservable = <In,Out>(
  inLoopFunction: (initialVal: In, index: number) => Promise<Out>,
  conditional: (loopValue: Out, index: number) => boolean,
  initialVal: In
): Rx.Observable<Out> =>
  new Rx.Observable(observer => {
    asyncLoop(initialVal, inLoopFunction, conditional, observer)
  })
