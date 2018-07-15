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

  init = async ({ folder }) => {
    this.db = new DB(folder)
    await this.db.run('PRAGMA journal_mode = WAL')

    await queries.createTables(this.flatConfig, this.db)()
    for (const key of Object.keys(queries)) {
      this[key] = await queries[key](this.flatConfig, this.db)
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

    const groupedRows = groupBy(
      result,
      'scraper',
      group_by,
      scrapers[group_by],
      selector => selector[scrapers[selector.scraper][0]]
    )
    return groupedRows
  }
}

export default Store
