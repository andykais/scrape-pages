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

  // const errorMsg = `expected event '${event}' to occur ${expectedCount} time(s) but actually ocurred ${count}`
  // new Assertion(count).to.be.equal(expectedCount, errorMsg)
  new Assertion(count).to.be.equal(expectedCount,  `event '${event}' occurrences`)
})
// Assertion.addMethod('haveEvent', async function(
//   event: string,
//   expectedCount: number,
//   checkAfterPromise: Promise<any>
// ) {
//   const emitterLikeObject = this._obj // (duck typing)

//   let count = 0
//   emitterLikeObject.on(event, () => {
//     count++
//   })

//   await checkAfterPromise

//   const errorMsg = `event '${event}' had ${event} expected at ${expectedCount}, but actually recorded ${count}`
//   new Assertion(count).to.be.equal(expectedCount, errorMsg)
// })

Assertion.addMethod('haveEvents', async function(
  eventCountExpected: EventCountExpected,
  checkAfterPromise: Promise<any>
) {
  const emitterLikeObject = this._obj

  const eventCountExpectedArray = Object.entries(eventCountExpected)

  const count: EventCountActual = {}
  for (const [event] of eventCountExpectedArray) {
    count[event] = 0
  }
  for (const [event] of eventCountExpectedArray) {
    emitterLikeObject.on(event, () => {
      count[event]++
    })
  }

  await checkAfterPromise

  for (const [event, expectedCount] of eventCountExpectedArray) {
    const errorMsg = `event '${event}' had ${event} expected at ${expectedCount}, but actually recorded ${count[event]}`
    new Assertion(count[event]).to.be.equal(expectedCount, errorMsg)
  }

  // for (const [event, count] of Object.entries(eventCountExpected)) {
  //   emitterLikeObject.on(event, () => {
  //
  // either of these work!
  //     counter[event] = (counter[event] || 0) + 1

  // or me!
  // //       if (counter[event] === undefined) {
  // //         counter[event] = 1
  // //       } else {
  // //         counter[event]++
  // //       }
  //   })
  // }

  //   const actualResult = this._obj
  //   new Assertion().to.be.deep.equal()
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

// TODO check for unhandled/uncaughtexcepitons
beforeEach(() => nock.cleanAll())
