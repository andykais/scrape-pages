// @flow
import { resolve } from 'path'
import sqlite3 from 'sqlite3'

class DB {
  database: any

  constructor(downloadFolder: string) {
    const verbose = sqlite3.verbose()
    this.database = new verbose.Database(resolve(downloadFolder, 'store.sql'))
    // this.database = sqlite3
    // .verbose()

    // .Database(resolve(downloadFolder, 'store.sql'))
  }

  _run = (method: string) => (sql: string, values: Array<any> = []) =>
    new Promise((resolve, reject) => {
      this.database[method](sql, values, (error, result) => {
        if (error) reject(error)
        else resolve(result)
      })
    })

  close = () =>
    new Promise((resolve, reject) =>
      this.database.close(error => {
        if (error) reject(error)
        else resolve()
      })
    )

  run = this._run('run')

  get = this._run('get')

  all = this._run('all')
}
export default DB
