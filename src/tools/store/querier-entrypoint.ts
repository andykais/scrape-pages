import { existsSync } from '../../util/fs'
import { UninitializedDatabaseError } from '../../util/errors'
import { Database } from './database'
import { groupUntilSeparator } from '../../util/array'
import { selectOrderedScrapers } from './queries'
import { typecheckQueryArguments } from '../../util/typechecking.runtime'
// type imports
import { Settings } from '../../settings'
import { ScraperName } from '../../settings/config/types'
import { SelectedRow as OrderedScrapersRow } from './queries/select-ordered-scrapers'
import { ArgumentTypes } from '../../util/types'

import * as readlineSync from 'readline-sync'

export const EXECUTION_DEBUGGER_VIEW = Symbol.for('query-execution-stepper')
const DEFAULT_VIEW = ['recurseDepth', 'incrementIndex', 'parseIndex', 'levelOrder', 'scraper']

// type DebuggerView = (keyof OrderedScrapersRow)[]
// TODO replace with an expanded set of OrderedScrapersRow including all columns
type DebuggerView = string[]
export type QueryArguments = {
  scrapers: ScraperName[]
  groupBy?: ScraperName
  // internal use only
  [EXECUTION_DEBUGGER_VIEW]?: DebuggerView
}
export interface QueryFn {
  prepare: (params: QueryArguments) => () => OrderedScrapersRow[][]
  (...args: ArgumentTypes<QueryFn['prepare']>): OrderedScrapersRow[][]
}

type OrderedScrapersRowDebug = OrderedScrapersRow & { [key: string]: any }
const queryExecutionDebugger = (
  scrapers: string[],
  settings: Settings,
  result: OrderedScrapersRowDebug[],
  debuggerView: DebuggerView
) => {
  readlineSync.question(
    'This is an internal debugging method. It will hault execution until there is input. Press [enter] to continue.',
    { mask: '' }
  )

  const scraperConfigs = scrapers.map(s => settings.flatConfig.getOrThrow(s))
  const lowestDepth = Math.max(...scraperConfigs.map(s => s.depth))

  const resultAsDepthMap: Map<number, OrderedScrapersRow[]> = result.reduce((acc, row) => {
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
    console.clear()
    console.table(viewable)
    key = readlineSync.keyIn(
      'Press [s] to move forward, press [w] to move backward, press [q] to exit the debugger',
      { limit: 'swq' }
    )

    if (key === 's' && index < resultSplitByDepth.length - 1) index++
    else if (key === 'w' && index > 0) index--
  }
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
    // TODO throw error when scrapers do not exist? This might make it more tedious to reuse some functions in other libs
    const { scrapers, groupBy, [EXECUTION_DEBUGGER_VIEW]: debuggerView } = queryArgs

    const databaseFile = Database.getFilePath(paramsInit.folder)
    if (existsSync(databaseFile)) {
      // this stateful stuff is necessary so we can give this to the user before creating folders
      database = new Database(paramsInit.folder)
    } else {
      throw new UninitializedDatabaseError(databaseFile)
    }

    if (!scrapers.some(s => flatConfig.has(s))) return () => []

    const scrapersInConfig = scrapers.concat(groupBy || []).filter(s => flatConfig.has(s))

    // TODO conditionally show the extra fields using debuggerView
    const preparedStatment = selectOrderedScrapers(flatConfig, database)(
      Array.from(new Set(scrapersInConfig)),
      Boolean(debuggerView)
    )
    return () => {
      const result = preparedStatment()

      if (debuggerView) queryExecutionDebugger(scrapers, settings, result, debuggerView)

      return groupBy !== undefined
        ? groupUntilSeparator(
            result,
            ({ scraper }) => scraper === groupBy,
            groupBy !== undefined && scrapers.includes(groupBy)
          )
        : [result]
    }
  }
  // create external query function
  const query: QueryFn = params => prepare(params)()
  // optionally call the `prepare` function first to get a prepared sqlite statement
  query.prepare = prepare
  return query
}

export { querierFactory }
