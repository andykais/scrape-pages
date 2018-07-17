import format from 'string-template'
import DB from './database'
import type { Config } from '../configuration/type'
import { makeFlatConfig } from '../configuration'
import * as queries from './queries'
import { groupBy } from '../util/array'

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

  queryFor = async ({ scrapers, group_by }) => {
    const scraperNames = Object.keys(scrapers)

    const matchingScrapers = scraperNames.filter(s => this.flatConfig[s])
    if (!matchingScrapers.length) return [{}]

    const matchingAll = Array.from(
      new Set(scraperNames.concat(group_by))
    ).filter(s => this.flatConfig[s])

    const result = await this.selectOrderedScrapers(matchingAll)
    console.log(
      result.map(r => r.scraper).reduce((acc, name) => {
        acc[name] = acc[name] || 0
        acc[name]++
        return acc
      }, {})
    )

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
    const groupedRows = groupBy(
      result,
      'scraper',
      group_by,
      scrapers[group_by],
      selector => objectPicker(selector, scrapers[selector.scraper])
      // selector => selector[scrapers[selector.scraper][0]]
    )
    return groupedRows
  }
}

export default Store
