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

export type QueryArguments = { scrapers: ScraperName[]; groupBy?: ScraperName }
export interface QueryFn {
  prepare: (params: QueryArguments) => () => OrderedScrapersRow[][]
  (...args: ArgumentTypes<QueryFn['prepare']>): OrderedScrapersRow[][]
}

/**
 * external function for grabbing data back out of the scraper
 * the first time the produced function is called, it will create the database & sql query
 * this statefull nonsense is necessary so we can give the user `query` before awaiting on folder creation
 */
const querierFactory = (settings: Settings): QueryFn => {
  const { flatConfig, paramsInit } = settings
  let firstCall = true
  let database: Database

  const prepare: QueryFn['prepare'] = queryArgs => {
    typecheckQueryArguments(queryArgs)
    const { scrapers, groupBy } = queryArgs
    if (firstCall) {
      const databaseFile = Database.getFilePath(paramsInit.folder)
      if (existsSync(databaseFile)) {
        // this stateful stuff is necessary so we can give this to the user before creating folders
        database = new Database(paramsInit.folder)
      } else {
        throw new UninitializedDatabaseError(databaseFile)
      }
    }
    if (!scrapers.some(s => flatConfig.has(s))) return () => []

    const scrapersInConfig = scrapers.concat(groupBy || []).filter(s => flatConfig.has(s))

    const preparedStatment = selectOrderedScrapers(flatConfig, database)([
      ...new Set(scrapersInConfig)
    ])
    return () => {
      const result = preparedStatment()
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
