import format from 'string-template'
import {
  makeDynamicOrderLevelColumn,
  makeWaitingConditionalJoins
} from '../../sql-generators'
import SQL_TEMPLATE from './template.sql'

export default (flatConfig, database) => {
  return scrapers => {
    const scraperConfigs = scrapers.map(s => flatConfig[s]).filter(c => c)

    const lowestDepth = Math.max(...scraperConfigs.map(s => s.depth))
    const orderLevelColumnSql = makeDynamicOrderLevelColumn(
      flatConfig,
      scrapers
    )
    const waitingJoinsSql = makeWaitingConditionalJoins(flatConfig, scrapers)

    const selectedScrapers = scrapers.map(s => `'${s}'`).join(',')

    const selectOrderedSql = format(SQL_TEMPLATE, {
      orderLevelColumnSql,
      waitingJoinsSql,
      selectedScrapers,
      lowestDepth
    })
    const statement = database.prepare(selectOrderedSql)
    return statement.all()
  }
}
