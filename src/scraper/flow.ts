import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import * as RxCustom from '../util/rxjs/observables'
import { ScrapeStep } from './scrape-step'
import { wrapError } from '../util/error'
// type imports
import { ParsedValue, DownloadParseFunction } from './scrape-step'
import { Config, ScrapeConfig } from '../settings/config/types'

type DownloadParseBoolean = (
  parsedValues: ParsedValue[],
  incrementIndex: number
) => boolean

const incrementUntilEmptyParse: DownloadParseBoolean = parsedValues =>
  !!parsedValues.length
const incrementUntilNumericIndex = (
  incrementUntil: number
): DownloadParseBoolean => (parsedValues, incrementIndex) =>
  incrementUntil >= incrementIndex
const incrementAlways = () => true

const catchFetchError = (e: Error) => {
  if (e.name === 'FetchError') return Rx.empty()
  else return Rx.throwError(e)
}
const throwAnyError = (e: Error) => Rx.throwError(e)

const chooseIncrementEvaluator = ({ incrementUntil }: ScrapeConfig) => {
  switch (incrementUntil) {
    case 'empty-parse':
      return incrementUntilEmptyParse
    case 'failed-download':
      return incrementAlways // failed download is handled in the try catch
    default:
      return incrementUntilNumericIndex(incrementUntil)
  }
}
const chooseIgnoreError = ({ incrementUntil }: ScrapeConfig) => {
  switch (incrementUntil) {
    case 'failed-download':
      return catchFetchError
    default:
      return throwAnyError
  }
}

const structureScrapers = (
  config: Config,
  scrapers: { [scraperName: string]: ScrapeStep }
) => (structure: Config['structure']) => {
  const scraper = scrapers[structure.scraper]
  const each = structure.scrapeEach.map(structureScrapers(config, scrapers))
  const next = structure.scrapeNext.map(structureScrapers(config, scrapers))

  const okToIncrement = chooseIncrementEvaluator(scraper.config)
  const ignoreFetchError = chooseIgnoreError(scraper.config)

  return (parentValues: ParsedValue[]): Rx.Observable<ParsedValue[]> =>
    Rx.from(parentValues).pipe(
      ops.catchError(wrapError(`scraper '${scraper.scraperName}'`)),
      ops.flatMap(parsedValueWithId =>
        RxCustom.whileLoop(
          scraper.downloadParseFunction,
          okToIncrement,
          parsedValueWithId
        ).pipe(
          // ops.takeWhile(), // move okToIncrement logic here?
          ops.catchError(ignoreFetchError),
          ops.flatMap((parsedValues, incrementIndex) =>
            Rx.of(parsedValues).pipe(
              ops.expand(parsedValues =>
                Rx.merge(
                  ...next.map(nextScraper =>
                    nextScraper(parsedValues).pipe(
                      ops.flatMap(parsedValues =>
                        parsedValues.map(parsedValueWithId =>
                          scraper.downloadParseFunction(
                            parsedValueWithId,
                            incrementIndex
                          )
                        )
                      ),
                      ops.mergeAll(),
                      ops.filter(incrementUntilEmptyParse)
                    )
                  )
                )
              )
            )
          )
        )
      ),
      each.length
        ? ops.flatMap(scraperValues => each.map(child => child(scraperValues)))
        : ops.map(scraperValues => [scraperValues]),
      ops.mergeAll()
    )
}

export { structureScrapers }
