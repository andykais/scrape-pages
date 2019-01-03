import { Database } from './database'
import { makeFlatConfig } from '../configuration/site-traversal'
import * as queries from './queries'
import { groupBy as groupByKey } from '../util/array'
import { Config, FlatConfig } from '../configuration/site-traversal/types'
import { createTables, createStatements } from './queries'

class Store {
  private config: Config
  private flatConfig: FlatConfig
  private database: Database
  public qs: ReturnType<typeof createStatements>

  constructor(config: Config) {
    this.config = config
    this.flatConfig = makeFlatConfig(config)
  }

  init = ({ folder }: { folder: string }) => {
    this.database = new Database(folder)
    this.database.pragma('journal_mode = WAL')

    createTables(this.flatConfig, this.database)()
    this.qs = createStatements(this.flatConfig, this.database)
  }

  asTransaction = <T>(func: () => T) => (): T => {
    this.qs.beginTransaction.run()
    try {
      const result = func()
      this.qs.commitTransaction.run()
      return result
    } finally {
      if (this.database.inTransaction) this.qs.rollbackTransaction.run()
    }
  }

  queryFor = ({
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

    const headers = [
      'id',
      'parentId',
      'incrementIndex',
      'levelOrder',
      'recurseDepth',
      'currentScraper',
      'filename',
      'parsedValue',
      'scraper'
    ]
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
