import { resolve } from 'path'
import BetterSqlite3Database from 'better-sqlite3'

class Database extends BetterSqlite3Database {
  public constructor(folder: string) {
    super(Database.getFilePath(folder))
  }

  public static getFilePath = (folder: string) => resolve(folder, 'store.sqlite')
}
export { Database }
