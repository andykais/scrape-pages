import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { ScrapeConfig } from '../../../settings/config/types'
import { ParsedValue } from '../'
import { whileLoopObservable } from '../../../util/rxjs/observables/while-loop'
import { ScrapeStep, IdentityScrapeStep } from '../'

type OkToIncrementWhileLoop = (
  parsedValues: ParsedValue[],
  incrementIndex: number
) => boolean

const incrementUntilEmptyParse: OkToIncrementWhileLoop = (
  parsedValues
): boolean => !!parsedValues.length

const incrementUntilNumericIndex = (
  incrementUntil: number
): OkToIncrementWhileLoop => (parsedValues, incrementIndex): boolean =>
  incrementUntil >= incrementIndex

const incrementAlways = () => true

const catchFetchError = (e: Error) => {
  if (e.name === 'FetchError') return Rx.empty()
  else return Rx.throwError(e)
}
const throwAnyError = (e: Error) => Rx.throwError(e)

export type DownloadParseFunction = (
  parsedValueWithId: ParsedValue,
  incrementIndex: number
) => Promise<ParsedValue[]>

type StatefulVars = {
  parsedCount: number
  incrementIndex: number
  nextPromises: Promise<{}>[]
}

const incrementer = (
  { incrementUntil }: ScrapeConfig,
  asyncFunction: DownloadParseFunction,
  scrapeNextChild: ScrapeStep | IdentityScrapeStep
) => {
  const okToIncrementWhileLoop: OkToIncrementWhileLoop =
    incrementUntil === 'empty-parse'
      ? incrementUntilEmptyParse
      : incrementUntil === 'failed-download'
        ? incrementAlways // failed download is handled in the try catch
        : incrementUntilNumericIndex(incrementUntil)

  const ignoreFetchError =
    incrementUntil === 'failed-download' ? catchFetchError : throwAnyError

  return (parsedValueWithId: ParsedValue): Rx.Observable<ParsedValue[]> =>
    whileLoopObservable(
      asyncFunction,
      okToIncrementWhileLoop,
      parsedValueWithId
    ).pipe(
      ops.catchError(ignoreFetchError),
      ops.flatMap((parsedValues, incrementIndex) =>
        Rx.of(parsedValues).pipe(
          ops.expand(parsedValues =>
            scrapeNextChild.run(parsedValues).pipe(
              ops.flatMap(parsedValues =>
                parsedValues.map(parsedValue =>
                  asyncFunction(parsedValue, incrementIndex)
                )
              ),
              ops.mergeAll(),
              ops.takeWhile(incrementUntilEmptyParse)
            )
          )
        )
      )
    )
}

export { incrementer }
