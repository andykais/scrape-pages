import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'

const whileLoop = <In, Out>(
  inLoopFunction: (initialVal: In, index: number) => Rx.ObservableInput<Out>,
  conditional: (loopValue: Out, index: number) => boolean,
  initialVal: In
): Rx.Observable<Out> =>
  Rx.from(inLoopFunction(initialVal, 0)).pipe(
    ops.expand((previousVal: Out, index: number) =>
      conditional(previousVal, index + 1) ? inLoopFunction(initialVal, index + 1) : Rx.empty()
    )
  )

export { whileLoop }
