import { resolve } from 'path'
import BetterSqlite3Database from 'better-sqlite3'
import { existsSync } from '../../util/fs'
import { UninitializedDatabaseError } from '../../util/errors'

class Database extends BetterSqlite3Database {
  public constructor(folder: string) {
    super(Database.getFilePath(folder))
  }

  public static getFilePath = (folder: string) => resolve(folder, 'store.sqlite')

  public static checkIfInitialized = (folder: string) => {
    const databaseFile = Database.getFilePath(folder)
    if (!existsSync(databaseFile)) throw new UninitializedDatabaseError(databaseFile)
  }
}
export { Database }
