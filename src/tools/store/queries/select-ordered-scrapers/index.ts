import { compileTemplate } from '../../../../util/handlebars'
import {
  makeDynamicOrderLevelColumn,
  makeWaitingConditionalJoins
} from '../../sql-generators'
import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type SelectedRow = {
  scraper: string
  id: number
  downloadId: number
  parsedValue?: string
  url?: string
  filename?: string
}
type Statement = (scrapers: string[]) => SelectedRow[]
export const query: CreateQuery<Statement> = (
  flatConfig,
  database
) => scrapers => {
  const scraperConfigs = scrapers.map(s => flatConfig[s]).filter(c => c)

  const lowestDepth = Math.max(...scraperConfigs.map(s => s.depth))
  const orderLevelColumnSql = makeDynamicOrderLevelColumn(flatConfig, scrapers)
  const waitingJoinsSql = makeWaitingConditionalJoins(flatConfig, scrapers)

  const selectedScrapers = scrapers.map(s => `'${s}'`).join(',')

  const selectOrderedSql = compileTemplate(SQL_TEMPLATE)({
    orderLevelColumnSql,
    waitingJoinsSql,
    selectedScrapers,
    lowestDepth
  })
  const statement = database.prepare(selectOrderedSql)
  return statement.all()
}
