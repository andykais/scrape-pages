import { createAssertType } from 'typescript-is'
import { Database } from './database'
import { selectOrderedScrapers } from './queries'
// import { typecheckQueryArguments } from '../../util/typechecking.runtime'
import { queryExecutionDebugger } from './query-debugger'
// type imports
import { DebuggerView } from './query-debugger'
import { Settings } from '../../settings'
import { ScraperName } from '../../settings/config/types'
import { SelectedRow as OrderedScrapersRow } from './queries/select-ordered-scrapers'
import { ArgumentTypes } from '../../util/types'

export const EXECUTION_DEBUGGER_VIEW = Symbol.for('query-execution-stepper')

type OrderedScraperGroup = { [scraperName: string]: OrderedScrapersRow[] }
type Options = { groupBy?: ScraperName; [EXECUTION_DEBUGGER_VIEW]?: DebuggerView }
export type QueryResult = OrderedScraperGroup[]
export interface QueryFn {
  prepare: (scrapers: ScraperName[], options?: Options) => () => QueryResult
  (...args: ArgumentTypes<QueryFn['prepare']>): QueryResult
}
export type QueryArgs = ArgumentTypes<QueryFn['prepare']>

const typecheckScrapers = createAssertType<ScraperName[]>()
const typecheckOptions = createAssertType<Options>()

/**
 * external function for grabbing data back out of the scraper
 * inside the prepare function we initailize the database connection and build the sql query
 * this statefull nonsense is necessary so we can give the user `query` before awaiting on folder creation
 */
const querierFactory = (settings: Settings): QueryFn => {
  const { flatConfig, paramsInit } = settings
  let database: Database

  const prepare: QueryFn['prepare'] = (scrapers, options = {}) => {
    typecheckScrapers(scrapers)
    typecheckOptions(options)

    let { groupBy } = options
    const debuggerView = options[EXECUTION_DEBUGGER_VIEW]

    // TODO throw error when scrapers do not exist? This might make it more tedious to reuse some functions in other libs
    scrapers = scrapers.filter(s => flatConfig.has(s))
    groupBy = groupBy && flatConfig.has(groupBy) ? groupBy : undefined
    if (scrapers.length === 0) return () => []

    if (!database) {
      Database.checkIfInitialized(paramsInit.folder)
      database = new Database(paramsInit.folder)
    }

    const scrapersInQuery = scrapers.concat(groupBy || [])

    const sqlCompiler = selectOrderedScrapers(flatConfig, database)
    const stmt = sqlCompiler(Array.from(new Set(scrapersInQuery)), false)

    return () => {
      if (debuggerView) queryExecutionDebugger(scrapersInQuery, sqlCompiler, debuggerView)

      const result = stmt()

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
  const query: QueryFn = (...args) => prepare(...args)()
  // optionally call the `prepare` function first to get a prepared sqlite statement
  query.prepare = prepare
  return query
}

export { querierFactory }
