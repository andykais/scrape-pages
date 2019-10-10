import * as readlineSync from 'readline-sync'
import { existsSync } from '../../util/fs'
import { UninitializedDatabaseError } from '../../util/errors'
import { Database } from './database'
import { selectOrderedScrapers } from './queries'
import { typecheckQueryArguments } from '../../util/typechecking.runtime'
// type imports
import { Settings } from '../../settings'
import { ScraperName } from '../../settings/config/types'
import {
  SelectedRow as OrderedScrapersRow,
  SelectedRowWithDebugInfo as OrderedScrapersRowWithDebug
} from './queries/select-ordered-scrapers'
import { ArgumentTypes } from '../../util/types'

type DebuggerView = (keyof OrderedScrapersRowWithDebug)[]
const queryExecutionDebugger = (
  scrapers: string[],
  settings: Settings,
  result: OrderedScrapersRow[],
  debuggerView: DebuggerView
) => {
  // we are cheating with the type here because function overloading in typescript doesnt play nicely with higher order functions
  const resultAsDebug = (result as any) as OrderedScrapersRowWithDebug[]
  readlineSync.question(
    'This is an internal debugging method. It will hault execution until there is input. Press [enter] to continue.',
    { mask: '' }
  )

  const scraperConfigs = scrapers.map(s => settings.flatConfig.getOrThrow(s))
  const lowestDepth = Math.max(...scraperConfigs.map(s => s.depth))

  const resultAsDepthMap: Map<number, OrderedScrapersRow[]> = resultAsDebug.reduce((acc, row) => {
    acc
      .set(row.recurseDepth, acc.get(row.recurseDepth) || [])
      .get(row.recurseDepth)!
      .push(row)
    return acc
  }, new Map())
  const resultSplitByDepth = Array.from(resultAsDepthMap.entries())
    // the need for this filter might be because of an error with this shite
    .filter(entry => entry[0] <= lowestDepth)
    .sort((a, b) => a[0] - b[0])
    .map(entry => entry[1])

  let key = ''
  let index = 0
  while (key !== 'q') {
    const resultAtDepth = resultSplitByDepth[index]
    const viewable = resultAtDepth.map(row =>
      // TODO move this to util/object.ts (filterObjectKeys)?
      debuggerView.reduce((acc: { [column: string]: any }, column) => {
        acc[column] = (row as any)[column]
        return acc
      }, {})
    )
    console.clear() // eslint-disable-line no-console
    console.table(viewable) // eslint-disable-line no-console
    key = readlineSync.keyIn(
      'Press [s] to move forward, press [w] to move backward, press [q] to exit the debugger',
      { limit: 'swq' }
    )

    if (key === 's' && index < resultSplitByDepth.length - 1) index++
    else if (key === 'w' && index > 0) index--
  }
}

export const EXECUTION_DEBUGGER_VIEW = Symbol.for('query-execution-stepper')
export type QueryArguments = {
  scrapers: ScraperName[]
  groupBy?: ScraperName
  // internal use only
  [EXECUTION_DEBUGGER_VIEW]?: DebuggerView
}
type OrderedScraperGroup = { [scraperName: string]: OrderedScrapersRow[] }
export type QueryResult = OrderedScraperGroup[]
export interface QueryFn {
  prepare: (params: QueryArguments) => () => QueryResult
  (...args: ArgumentTypes<QueryFn['prepare']>): QueryResult
}

/**
 * external function for grabbing data back out of the scraper
 * inside the prepare function we initailize the database connection and build the sql query
 * this statefull nonsense is necessary so we can give the user `query` before awaiting on folder creation
 */
const querierFactory = (settings: Settings): QueryFn => {
  const { flatConfig, paramsInit } = settings
  let database: Database

  const prepare: QueryFn['prepare'] = queryArgs => {
    typecheckQueryArguments(queryArgs)

    let { scrapers, groupBy, [EXECUTION_DEBUGGER_VIEW]: debuggerView } = queryArgs
    // TODO throw error when scrapers do not exist? This might make it more tedious to reuse some functions in other libs
    scrapers = scrapers.filter(s => flatConfig.has(s))
    groupBy = groupBy && flatConfig.has(groupBy) ? groupBy : undefined
    if (scrapers.length === 0) return () => []

    const databaseFile = Database.getFilePath(paramsInit.folder)
    if (existsSync(databaseFile)) {
      // this stateful stuff is necessary so we can give this to the user before creating folders
      database = new Database(paramsInit.folder)
    } else {
      throw new UninitializedDatabaseError(databaseFile)
    }

    const scrapersInQuery = scrapers.concat(groupBy || [])

    const preparedStatment = selectOrderedScrapers(flatConfig, database)(
      Array.from(new Set(scrapersInQuery)),
      Boolean(debuggerView)
    )

    return () => {
      const result = preparedStatment()

      if (debuggerView) queryExecutionDebugger(scrapersInQuery, settings, result, debuggerView)

      const groupedResults = []
      let groupCount = 0
      let group: OrderedScraperGroup = scrapers.reduce((acc: OrderedScraperGroup, name) => {
        acc[name] = []
        return acc
      }, {})
      const initialGroupCopy = JSON.stringify(group)

      for (const row of result) {
        if ((groupBy && scrapers.includes(groupBy)) || row.scraper !== groupBy) {
          group[row.scraper].push(row)
          groupCount++
        }
        if (row.scraper === groupBy) {
          if (groupCount !== 0) {
            groupedResults.push(group)
            group = JSON.parse(initialGroupCopy)
            groupCount = 0
          }
        }
      }
      if (groupCount !== 0) groupedResults.push(group)

      return groupedResults
    }
  }
  // create external query function
  const query: QueryFn = params => prepare(params)()
  // optionally call the `prepare` function first to get a prepared sqlite statement
  query.prepare = prepare
  return query
}

export { querierFactory }
