import { ToolBase } from '../abstract'
import { Database } from './database'
import { createTables, createStatements } from './queries'
import { querierFactory } from './querier-entrypoint'
// type imports
import { Transaction } from 'better-sqlite3'
import { Settings } from '../../settings'

class Store extends ToolBase {
  public static querierFactory = querierFactory

  public _qs: ReturnType<typeof createStatements>
  public _transaction: Transaction
  private database: Database

  public constructor(settings: Settings) {
    super(settings)
  }

  public get qs() {
    this.throwIfUninitialized()
    return this._qs
  }
  public get transaction() {
    this.throwIfUninitialized()
    return this._transaction
  }

  public initialize() {
    // initialize sqlite3 database
    this.database = new Database(this.settings.paramsInit.folder)
    this.database.pragma('journal_mode = WAL')
    // TODO move lower?
    this._transaction = this.database.transaction.bind(this.database)
    // initialize tables (if they do not exist already)
    createTables(this.settings.flatConfig, this.database)()
    // prepare statements
    this._qs = createStatements(this.settings.flatConfig, this.database)

    super.initialize()
  }

  public cleanup() {}
}

export { Store }
