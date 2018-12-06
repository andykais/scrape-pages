import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { fromAsyncGenerator } from '../../../util/rxjs/observables'
import { ScrapeConfig } from '../../../configuration/site-traversal/types'
import { ParsedValue } from '../'
import { whileLoopObservable } from '../../../util/rxjs/observables/while-loop'

const incrementUntilEmptyParse = (
  parsedValues: ParsedValue[],
  incrementIndex: number
): boolean => !!parsedValues.length

const incrementUntilNumericIndex = (incrementUntil: number) => (
  parsedValues: ParsedValue[],
  incrementIndex: number
): boolean => incrementUntil >= incrementIndex

const incrementAlways = () => true

export type DownloadParseFunction = (
  parsedValueWithId: ParsedValue,
  incrementIndex: number
) => Promise<ParsedValue[]>

type StatefulVars = {
  parsedCount: number
  incrementIndex: number
  nextPromises: Promise<{}>[]
}

const incrementer = ({ name, incrementUntil }: ScrapeConfig) => {
  const okToIncrementWhileLoop =
    incrementUntil === 'empty-parse'
      ? incrementUntilEmptyParse
      : incrementUntil === 'failed-download'
        ? incrementAlways // failed download is handled in the try catch
        : incrementUntilNumericIndex(incrementUntil)

  const okToIncrementScrapeNext =
    incrementUntil === 'empty-parse'
      ? incrementUntilEmptyParse
      : incrementUntil === 'failed-download'
        ? incrementAlways // failed download is handled in the try catch
        : incrementUntilNumericIndex(incrementUntil)

  return (
    asyncFunction: DownloadParseFunction,
    scrapeNextChild: (
      parsedValues: ParsedValue[]
    ) => Rx.Observable<ParsedValue[]>
  ) => {
    return (parsedValueWithId: ParsedValue): Rx.Observable<ParsedValue[]> =>
      whileLoopObservable(
        asyncFunction,
        okToIncrementWhileLoop,
        parsedValueWithId
      ).pipe(
        ops.expand((parsedValues, index) => {
          if (name === 'next-batch-id')
            console.log(name, { index }, 'downloading', parsedValues.length)
          return scrapeNextChild(parsedValues).pipe(
            ops.flatMap(parsedValues =>
              // TODO get proper scrape next index for asyncFunction
              parsedValues.map(parsedValue => asyncFunction(parsedValue, index))
            ),
            ops.mergeAll(),
            ops.takeWhile(incrementUntilEmptyParse)
          )
        })
      )
  }
}

export default incrementer
