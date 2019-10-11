import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import * as RxCustom from '../util/rxjs/observables'
import { ScrapeStep } from './scrape-step'
import { wrapError } from '../util/rxjs/operators'
import { FetchError, ResponseError } from '../util/errors'
// type imports
import { Tools } from '../tools'
import { ParsedValue } from './scrape-step'
import { Settings } from '../settings'
import { FlowStep, Scraper } from '../settings/config/types'

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
  if (e instanceof FetchError || e instanceof ResponseError) return Rx.empty()
  else return Rx.throwError(e)
}
const throwAnyError = (e: Error) => Rx.throwError(e)

const chooseIncrementEvaluator = ({ incrementUntil }: Scraper): DownloadParseBoolean => {
  switch (incrementUntil) {
    case 'empty-parse':
      return incrementUntilEmptyParse
    case 'failed-download':
      return incrementAlways // failed download is handled in the try catch
    default:
      return incrementUntilNumericIndex(incrementUntil)
  }
}
const chooseIgnoreError = ({ incrementUntil }: Scraper) => {
  switch (incrementUntil) {
    case 'failed-download':
      return catchDownloadError
    default:
      return throwAnyError
  }
}

type ScraperPipeline = Rx.UnaryFunction<Rx.Observable<ParsedValue>, Rx.Observable<ParsedValue>>
const setupFlowPipeline = (settings: Settings, tools: Tools) => (
  flow: FlowStep[]
): ScraperPipeline => {
  const downPipeline: ScraperPipeline[] = flow.map(flowStep => {
    const config = flowStep.scrape
    // TODO replace these with objects? We should probably trust the values at this point
    const options = settings.flatOptions.getOrThrow(config.name)
    const params = settings.flatParams.getOrThrow(config.name)

    const scraper = new ScrapeStep({ config, options, params }, tools)
    const branch = flowStep.branch.map(setupFlowPipeline(settings, tools))
    const recurse = flowStep.recurse.map(setupFlowPipeline(settings, tools))

    const outsideCommands = { stop: false }
    tools.emitter.scraper(config.name).on.stop(() => (outsideCommands.stop = true))

    const okToIncrement = chooseIncrementEvaluator(scraper.config)
    const ignoreFetchError = chooseIgnoreError(scraper.config)

    // TODO encode/classify/contractify the value,index relationship?
    return Rx.pipe(
      ops.takeWhile(() => !outsideCommands.stop), // itd be nice to use an Rx.fromEvent, but something funky is happeneing here
      ops.flatMap(parentValue =>
        RxCustom.whileLoop(scraper.downloadParseFunction, okToIncrement, parentValue)
      ),
      ops.takeWhile(() => !outsideCommands.stop),
      ops.map((parsedValues, index): [ParsedValue[], number] => [parsedValues, index]),
      ops.catchError(ignoreFetchError),
      // recursion step
      ops.expand(([parsedValues, incrementIndex]) =>
        Rx.merge(
          ...recurse.map(recursePipeline =>
            Rx.from(parsedValues).pipe(
              recursePipeline,
              ops.flatMap(parsedValueWithId =>
                scraper.downloadParseFunction(parsedValueWithId, incrementIndex)
              ),
              ops.filter(incrementUntilEmptyParse),
              ops.map((parsedValues): [ParsedValue[], number] => [parsedValues, incrementIndex])
            )
          )
        )
      ),
      ops.catchError(wrapError(`scraper '${scraper.scraperName}'`)),
      // branching step
      ops.flatMap(([parsedValues]) => {
        const branchesSource = branch.map(branchPipeline =>
          Rx.from(parsedValues).pipe(branchPipeline)
        )
        return branchesSource.length ? Rx.merge(...branchesSource) : Rx.from(parsedValues)
        // the old fashioned way data flew. Only DOWN and RIGHT, not this mergin left-diagonal
        // return Rx.merge(Rx.of(parsedValues), Rx.merge(...branchesSource).pipe(ops.filter(x=>false)))
      })
      // ops.mergeAll()
    )
  })
  return (Rx.pipe as any)(...downPipeline)
}

const compileProgram = (settings: Settings, tools: Tools): Rx.Observable<ParsedValue> => {
  const pipes = setupFlowPipeline(settings, tools)(settings.config.flow)

  const source: Rx.Observable<ParsedValue> = Rx.of({ parsedValue: '' })

  // we lose type info when calling apply
  // pipe args cannot be spread in typescript https://github.com/ReactiveX/rxjs/issues/3989
  return source.pipe(pipes)
}

export { compileProgram }
