import * as nock from 'nock'
// type imports
import { Assertion } from 'chai'
import { Overwrite } from '../src/util/types'
import { SelectedRow as OrderedScrapersRow } from '../src/tools/store/queries/select-ordered-scrapers'
import { QueryResult } from '../src/tools/store/querier-entrypoint'

type EventCountExpected = {
  [eventName: string]: number
}
type EventCountActual = EventCountExpected

type EmitterLike = { onAny(listener: (event: string, ...args: any[]) => void): EmitterLike }
type EventCounts = { [event: string]: number }
export function recordEvents(emitterLike: EmitterLike) {
  const eventCounts: EventCounts = {}
  emitterLike.onAny(event => {
    eventCounts[event] = eventCounts[event] || 0
    eventCounts[event]++
  })

  return eventCounts
}
Assertion.addMethod('haveEvent', function(event: string, expectedCount: number) {
  const eventCounts: EventCounts = this._obj
  const count = eventCounts[event] || 0

  new Assertion(count).to.be.equal(expectedCount, `event '${event}' occurrences`)
})

Assertion.addMethod('equalQueryResult', function(expectedResult) {
  const actualResult = this._obj
  new Assertion(stripResult(actualResult)).to.be.deep.equal(stripResult(expectedResult))
})

type StrippedQueryResultRow = Overwrite<
  OrderedScrapersRow,
  {
    filename: boolean
    id: boolean
  }
>
type StrippedQueryResult = { [scraper: string]: StrippedQueryResultRow[] }[]
// were dealing with unpredictable insert order, so we just want to check if the keys exist or not
export const stripResult = (result: QueryResult): StrippedQueryResult =>
  result.map(g =>
    Object.keys(g).reduce((acc: StrippedQueryResult[0], scraperName) => {
      acc[scraperName] = g[scraperName].map(r => ({
        ...r,
        filename: typeof r.filename === 'string' ? true : false,
        id: typeof r.id === 'number' ? true : false
      }))
      return acc
    }, {})
  )

beforeEach(() => {
  nock.cleanAll()
  process.removeAllListeners('unhandledRejection')
  process.removeAllListeners('uncaughtException')
})
