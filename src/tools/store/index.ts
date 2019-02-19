import { Database } from './database'
import { flattenConfig } from '../../settings/config'
import { groupUntilSeparator } from '../../util/array'
import { Config, FlatConfig } from '../../settings/config/types'
import { createTables, createStatements } from './queries'
// type imports
import { Transaction } from 'better-sqlite3'
import { ScraperName } from '../../settings/config/types'
import { OptionsInit } from '../../settings/options/types'

class Store {
  public qs: ReturnType<typeof createStatements>
  public transaction: Transaction
  private config: Config
  private flatConfig: FlatConfig
  private database: Database

  public constructor(config: Config, { folder }: OptionsInit) {
    this.config = config
    this.flatConfig = flattenConfig(config)
    // initialize sqlite3 database
    this.database = new Database(folder)
    this.database.pragma('journal_mode = WAL')
    this.transaction = this.database.transaction.bind(this.database)
    // initialize tables (if they do not exist already)
    createTables(this.flatConfig, this.database)()
    // prepare statements
    this.qs = createStatements(this.flatConfig, this.database)
  }

  public query = ({ scrapers, groupBy }: { scrapers: ScraperName[]; groupBy?: ScraperName }) => {
    if (!scrapers.filter(s => this.flatConfig.get(s)).length) return []

    const allExistingScrapers = [...new Set(scrapers.concat(groupBy || []))].filter(s =>
      this.flatConfig.get(s)
    )

    const result = this.qs.selectOrderedScrapers(allExistingScrapers)

    return groupUntilSeparator(
      result,
      ({ scraper }) => scraper === groupBy,
      groupBy !== undefined && scrapers.includes(groupBy)
    )
  }
}

export { Store }
