import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type SelectedRow = { id: number; filename: string | undefined; downloadValue: string } | undefined
type Statement = (scraper: string, downloadData: any) => SelectedRow
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return (scraper, downloadData) => statement.get(scraper, JSON.stringify(downloadData))
}
