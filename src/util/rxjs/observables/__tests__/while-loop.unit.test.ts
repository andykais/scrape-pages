import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { whileLoop } from '../while-loop'
// testing imports
import { rxjsTestScheduler } from '../../../../../testing/setup'

describe('while-loop observable', () => {
  it('should not execute inLoopFunction after conditional returns false', () => {
    const asyncFunction = (initialVal: string, index: number) => Rx.of(index).pipe(ops.delay(1))
    const conditional = (incrementUntil: number) => (outVal: number, index: number) =>
      incrementUntil >= index

    rxjsTestScheduler(helpers => {
      const { expectObservable } = helpers
      const expected = '-01(2|)'

      expectObservable(
        whileLoop(asyncFunction, conditional(2), 'a').pipe(ops.map(val => val.toString()))
      ).toBe(expected)
    })
  })
})
