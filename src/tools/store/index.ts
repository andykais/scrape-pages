import { Database } from './database'
import { makeFlatConfig } from '../../settings/config'
import { groupBy as groupByKey } from '../../util/array'
import { Config, FlatConfig } from '../../settings/config/types'
import { createTables, createStatements } from './queries'
// type imports
import { Transaction } from 'better-sqlite3'
import { OptionsInit } from '../../settings/options/types'

class Store {
  private config: Config
  private flatConfig: FlatConfig
  private database: Database
  public qs: ReturnType<typeof createStatements>

  public constructor(config: Config, { folder }: OptionsInit) {
    this.config = config
    this.flatConfig = makeFlatConfig(config)
    // initialize sqlite3 database
    this.database = new Database(folder)
    this.database.pragma('journal_mode = WAL')
    // initialize tables (if they do not exist already)
    createTables(this.flatConfig, this.database)()
    // prepare statements
    this.qs = createStatements(this.flatConfig, this.database)
  }

  public transaction = <T>(func: () => T): Transaction => {
    return this.database.transaction(func)
  }

  public queryFor = ({
    scrapers,
    groupBy
  }: {
    scrapers: string[]
    groupBy?: string
  }) => {
    // const scraperNames = Object.keys(scrapers)

    const matchingScrapers = scrapers.filter(s => this.flatConfig[s])
    if (!matchingScrapers.length) return [{}]

    const matchingAll = Array.from(
      new Set(scrapers.concat(groupBy === undefined ? [] : groupBy))
    ).filter(s => this.flatConfig[s])
    // const matchingAll = Array.from(
    // new Set(scraperNames.concat(groupBy))
    // ).filter(s => this.flatConfig[s])

    const result = this.qs.selectOrderedScrapers(matchingAll)
    // console.log(
    // result.map(r => r.scraper).reduce((acc, name) => {
    // acc[name] = acc[name] || 0
    // acc[name]++
    // return acc
    // }, {})
    // )

    /** logging helper
    // const headers = [
    //   'id',
    //   'parentId',
    //   'incrementIndex',
    //   'levelOrder',
    //   'recurseDepth',
    //   'currentScraper',
    //   'filename',
    //   'parsedValue',
    //   'scraper'
    // ]
    // console.log([
    // headers.join(' | '),
    // ...result.map(r => {
    // return headers
    // .map(key =>
    // (r[key] === null ? 'NULL' : r[key])
    // .toString()
    // .replace(/\n/g, '')
    // .padStart(key === 'scraper' ? 0 : key.length)
    // .slice(key === 'scraper' ? null : -key.length)
    // )
    // .join(' | ')
    // })
    // ])
    */

    // TODO move this into sql
    // const objectPicker = (
    // object: { [name: string]: any },
    // selections: string[]
    // ): any => {
    // const accepted: any = {}
    // for (const selection of selections) {
    // const value = object[selection]
    // if (value) {
    // accepted[selection] = value
    // }
    // }
    // return accepted
    // }
    // console.log({ result })
    const groupedRows = groupByKey(
      result,
      'scraper',
      groupBy,
      groupBy !== undefined && scrapers.includes(groupBy),
      selector => selector
      // selector => objectPicker(selector, scrapers[selector.scraper])
    )
    return groupedRows
  }
}

export { Store }