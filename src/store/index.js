import format from 'string-template'
import DB from './database'
import type { Config } from '../configuration/type'
import { makeFlatConfig } from '../configuration'
import * as queries from './queries'
import { groupBy as groupByKey } from '../util/array'

class Store {
  constructor(config) {
    this.config = config
    this.flatConfig = makeFlatConfig(config)
  }

  init = ({ folder }) => {
    this.database = new DB(folder)
    this.database.pragma('journal_mode = WAL')

    queries.createTables(this.flatConfig, this.database)()
    for (const key of Object.keys(queries)) {
      this[key] = queries[key](this.flatConfig, this.database)
    }
    // helper statements
    this.beginTransaction = this.database.prepare('BEGIN TRANSACTION')
    this.commitTransaction = this.database.prepare('COMMIT')
    this.rollbackTransaction = this.database.prepare('ROLLBACK')
  }

  asTransaction = func => (...args) => {
    this.beginTransaction.run()
    try {
      const result = func(...args)
      this.commitTransaction.run()
      return result
    } finally {
      if (this.database.inTransaction) this.rollbackTransaction.run()
    }
  }

  queryFor = async ({ scrapers, groupBy }) => {
    const scraperNames = Object.keys(scrapers)

    const matchingScrapers = scraperNames.filter(s => this.flatConfig[s])
    if (!matchingScrapers.length) return [{}]

    const matchingAll = Array.from(
      new Set(scraperNames.concat(groupBy))
    ).filter(s => this.flatConfig[s])

    const result = await this.selectOrderedScrapers(matchingAll)
    console.log(
      result.map(r => r.scraper).reduce((acc, name) => {
        acc[name] = acc[name] || 0
        acc[name]++
        return acc
      }, {})
    )

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
    const objectPicker = (object, selections) => {
      const accepted = {}
      for (const selection of selections) {
        const value = object[selection]
        if (value) {
          accepted[selection] = value
        }
      }
      return accepted
    }
    const groupedRows = groupByKey(
      result,
      'scraper',
      groupBy,
      scrapers[groupBy],
      selector => objectPicker(selector, scrapers[selector.scraper])
    )
    return groupedRows
  }
}

export default Store
