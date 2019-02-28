import { Database } from './database'
import { groupUntilSeparator } from '../../util/array'
import { Config, FlatConfig } from '../../settings/config/types'
import { createTables, createStatements, selectOrderedScrapers } from './queries'
// type imports
import { Transaction } from 'better-sqlite3'
import { Settings } from '../../settings'
import { ScraperName } from '../../settings/config/types'
import { SelectedRow as OrderedScrapersRow } from './queries/select-ordered-scrapers'

class Store {
  public qs: ReturnType<typeof createStatements>
  public transaction: Transaction
  private config: Config
  private flatConfig: FlatConfig
  private database: Database

  public constructor({ config, flatConfig, paramsInit: { folder } }: Settings) {
    this.config = config
    this.flatConfig = flatConfig
    // initialize sqlite3 database
    this.database = new Database(folder)
    this.database.pragma('journal_mode = WAL')
    this.transaction = this.database.transaction.bind(this.database)
    // initialize tables (if they do not exist already)
    createTables(this.flatConfig, this.database)()
    // prepare statements
    this.qs = createStatements(this.flatConfig, this.database)
  }

  /**
   * external function for grabbing data back out of the scraper
   * the first time the produced function is called, it will create the database & sql query
   * this statefull nonsense is necessary so we can give the user `query` before awaiting on folder creation
   */
  public static getQuerier = (settings: Settings): QueryFn => {
    const { flatConfig, paramsInit } = settings
    let firstCall = true
    let database: Database

    const prepare: QueryFn['prepare'] = ({ scrapers, groupBy }) => {
      if (firstCall) {
        // this stateful stuff is necessary so we can give this to the user before creating folders
        database = new Database(paramsInit.folder)
      }
      if (!scrapers.some(s => flatConfig.has(s))) return () => []

      const scrapersInConfig = scrapers.concat(groupBy || []).filter(s => flatConfig.has(s))

      const preparedStatment = selectOrderedScrapers(flatConfig, database)([
        ...new Set(scrapersInConfig)
      ])
      return () => {
        const result = preparedStatment()
        return groupUntilSeparator(
          result,
          ({ scraper }) => scraper === groupBy,
          groupBy !== undefined && scrapers.includes(groupBy)
        )
      }
    }
    // create external query function
    const query: QueryFn = params => prepare(params)()
    // optionally call the `prepare` function first to get a prepared sqlite statement
    query.prepare = prepare
    return query
  }
}

interface QueryFn {
  (...args: ArgumentTypes<QueryFn['prepare']>): OrderedScrapersRow[][]
  prepare: (
    params: { scrapers: ScraperName[]; groupBy?: ScraperName }
  ) => () => OrderedScrapersRow[][]
}

export { Store }
