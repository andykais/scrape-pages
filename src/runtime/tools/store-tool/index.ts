import * as path from 'path'
import Sqlite3 from 'better-sqlite3'
import * as fs from '@scrape-pages/util/fs'
import { FMap } from '@scrape-pages/util/map'
import { RuntimeBase } from '@scrape-pages/runtime/runtime-base'
import * as queries from './queries'

class Store extends RuntimeBase {
  private database: Sqlite3.Database
  private _qs: queries.Queries
  public _transaction: Sqlite3.Transaction

  public constructor() {
    super('Store')
  }

  public get qs() {
    this.mustBeInitialized()
    return this._qs
  }
  public get transaction() {
    this.mustBeInitialized()
    return this._transaction
  }

  public async initialize(folder: string) {
    this.database = new Sqlite3(Store.getSqliteFile(folder))
    this.database.pragma('journal_mode = WAL')

    this._qs = queries.createStatements(this.database)
    this._transaction = this.database.transaction.bind(this.database)

    this._qs.createTables()
  }
  public async cleanup() {}

  private static getSqliteFile(folder: string) {
    return path.resolve(folder, 'store.sqlite')
  }
  public static databaseIsInitialized(folder: string) {
    return fs.existsSync(Store.getSqliteFile(folder))
  }
}

export { Store }
