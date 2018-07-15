// @flow
import { resolve } from 'path'
import sqlite3 from 'sqlite3'

class DB {
  database: any

  constructor(folder: string) {
    const verbose = sqlite3.verbose()
    this.database = new verbose.Database(resolve(folder, 'store.sqlite'))
    // this.database = sqlite3
    // .verbose()

    // .Database(resolve(downloadFolder, 'store.sql'))
  }

  prepare = (sql, params) =>
    new Promise((resolve, reject) => {
      const statement = this.database.prepare(sql, params, error => {
        if (error) reject(error)
        else resolve(statement)
      })
    })
  bind = (statment, params) =>
    new Promise((resolve, reject) =>
      statement.bind(params, error => {
        if (error) reject(error)
        else resolve()
      })
    )

  _run = (method: string) => (sql: string, values: Array<any> = []) =>
    new Promise((resolve, reject) => {
      this.database[method](sql, values, function(error, result) {
        if (error) reject(error)
        else resolve({ result, id: this.lastID })
      })
    })

  close = () =>
    new Promise((resolve, reject) =>
      this.database.close(error => {
        if (error) reject(error)
        else resolve()
      })
    )

  exec = (sql: string) =>
    new Promise((resolve, reject) => {
      this.database.exec(sql, error => {
        if (error) reject(error)
        else resolve()
      })
    })

  run = (sql, values) => this._run('run')(sql, values).then(({ id }) => id)

  get = (sql, values) =>
    this._run('get')(sql, values).then(({ result }) => result)

  all = (sql, values) =>
    this._run('all')(sql, values).then(({ result }) => result)
}
export default DB
