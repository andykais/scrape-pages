import * as Fetch from 'node-fetch'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import * as RxCustom from '../util/rxjs/observables'
import { ScrapeStep } from './scrape-step'
import { wrapError, ResponseError } from '../util/error'
// type imports
import { Tools } from '../tools'
import { FMap } from '../util/map'
import { ParsedValue } from './scrape-step'
import { Settings } from '../settings'
import { Config, ScrapeConfig, ScraperName } from '../settings/config/types'

type DownloadParseBoolean = (parsedValues: ParsedValue[], incrementIndex: number) => boolean

const incrementUntilEmptyParse: DownloadParseBoolean = parsedValues => !!parsedValues.length
const incrementUntilNumericIndex = (incrementUntil: number): DownloadParseBoolean => (
  parsedValues,
  incrementIndex
) => {
  // console.log(incrementUntil, incrementIndex, { eval: incrementUntil >= incrementIndex })
  return incrementUntil >= incrementIndex
}
const incrementAlways = () => true

const catchDownloadError = (e: Error) => {
  if (e instanceof Fetch.FetchError || e instanceof ResponseError) return Rx.empty()
  else return Rx.throwError(e)
}
const throwAnyError = (e: Error) => Rx.throwError(e)

const chooseIncrementEvaluator = ({ incrementUntil }: ScrapeConfig): DownloadParseBoolean => {
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
      return catchDownloadError
    default:
      return throwAnyError
  }
}

const structureScrapers = (
  settings: Settings,
  scrapers: FMap<ScraperName, ScrapeStep>,
  tools: Tools
) => (structure: Config['run']) => {
  const scraper = scrapers.getOrThrow(structure.scraper)
  const each = structure.forEach.map(structureScrapers(settings, scrapers, tools))
  const next = structure.forNext.map(structureScrapers(settings, scrapers, tools))

  const okToIncrement = chooseIncrementEvaluator(scraper.config)
  const ignoreFetchError = chooseIgnoreError(scraper.config)

  const outsideCommands = { stop: false }
  tools.emitter.scraper(structure.scraper).on.stop(() => (outsideCommands.stop = true))

  return (parentValues: ParsedValue[]): Rx.Observable<ParsedValue[]> =>
    Rx.from(parentValues)
      .pipe(
        // scraper
        ops.takeWhile(() => !outsideCommands.stop),
        ops.flatMap(parentValue =>
          RxCustom.whileLoop(scraper.downloadParseFunction, okToIncrement, parentValue)
        ),
        ops.takeWhile(() => !outsideCommands.stop),
        ops.map((parsedValues, index): [ParsedValue[], number] => [parsedValues, index]),
        ops.catchError(ignoreFetchError)
      )
      .pipe(
        // next
        ops.expand(([parsedValues, incrementIndex]) =>
          Rx.merge(
            ...next.map(nextScraper =>
              nextScraper(parsedValues).pipe(
                ops.flatMap(parsedValues =>
                  parsedValues.map(parsedValueWithId =>
                    scraper.downloadParseFunction(parsedValueWithId, incrementIndex)
                  )
                ),
                ops.mergeAll(),
                ops.filter(incrementUntilEmptyParse),
                ops.map((parsedValues): [ParsedValue[], number] => [parsedValues, incrementIndex])
              )
            )
          )
        ),
        ops.map(([parsedValues]) => parsedValues)
      )
      .pipe(ops.catchError(wrapError(`scraper '${scraper.scraperName}'`)))
      .pipe(
        // each
        each.length
          ? ops.flatMap(scraperValues => each.map(child => child(scraperValues)))
          : ops.map(scraperValues => [scraperValues]),
        ops.mergeAll()
      )
}

export { structureScrapers }
