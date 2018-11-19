import { fromAsyncGenerator } from '../../../util/rxjs/observables'
import { ScrapeConfig } from '../../../configuration/site-traversal/types'
import { ParsedValue } from '../'

const incrementUntilEmptyParse = (
  incrementIndex: number,
  parsedCount: number
): boolean => !!parsedCount

const incrementUntilNumericIndex = (incrementUntil: number) => (
  incrementIndex: number,
  parsedCount: number
): boolean => incrementUntil >= incrementIndex

const incrementAlways = () => true

type DownloadParseFunction = (incrementIndex: number) => Promise<ParsedValue[]>

const incrementer = ({ name, incrementUntil }: ScrapeConfig) => {
  const okToIncrementWhileLoop =
    incrementUntil === 'empty-parse'
      ? incrementUntilEmptyParse
      : incrementUntil === 'failed-download'
        ? incrementAlways // failed download is handled in the try catch
        : incrementUntilNumericIndex(incrementUntil)

  return (asyncFunction: DownloadParseFunction) =>
    fromAsyncGenerator(async function*() {
      let parsedCount = 0
      let incrementIndex = 0
      do {
        try {
          const result = await asyncFunction(incrementIndex)
          parsedCount = result.length
          yield result
        } catch (e) {
          // if error is also from fetcher
          if (incrementUntil === 'failed-download') break
          else throw e
        }
        incrementIndex++
      } while (okToIncrementWhileLoop(incrementIndex, parsedCount))
    })
}
export default incrementer
