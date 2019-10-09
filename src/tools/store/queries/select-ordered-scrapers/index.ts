import { compileTemplate } from '../../../../util/handlebars'
import { makeDynamicOrderLevelColumn, makeWaitingConditionalJoins } from '../../sql-generators'
import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

export type SelectedRow = {
  scraper: string
  id: number
  // downloadId: number
  parsedValue?: string
  downloadData: string | null
  filename: string | null
  byteLength: string | null
  complete: number
}
type Statement = (scrapers: string[], debugMode: boolean) => () => SelectedRow[]
export const query: CreateQuery<Statement> = (flatConfig, database) => (scrapers, debugMode) => {
  const scraperConfigs = scrapers.map(flatConfig.getOrThrow)

  const lowestDepth = Math.max(...scraperConfigs.map(s => s.depth))
  const orderLevelColumnSql = makeDynamicOrderLevelColumn(flatConfig, scrapers)
  const waitingJoinsSql = makeWaitingConditionalJoins(flatConfig, scrapers)
  console.log({ orderLevelColumnSql })
  console.log({ waitingJoinsSql })

  const selectedScrapers = scrapers.map(s => `'${s}'`).join(',')

  const selectOrderedSql = compileTemplate(SQL_TEMPLATE)({
    orderLevelColumnSql,
    waitingJoinsSql,
    selectedScrapers,
    lowestDepth,
    debugMode
  })
  const statement = database.prepare(selectOrderedSql)
  return () => statement.all()
}
