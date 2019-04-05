import { Database } from './database'
import { Config, FlatConfig } from '../../settings/config/types'
import { createTables, createStatements } from './queries'
import { querierFactory } from './querier-entrypoint'
// type imports
import { Transaction } from 'better-sqlite3'
import { Settings } from '../../settings'

class Store {
  public static querierFactory = querierFactory

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
}

export { Store }
