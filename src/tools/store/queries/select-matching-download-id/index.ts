import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type SelectedRow = { id: number; filename: string | undefined } | undefined
type Statement = (downloadData: any) => SelectedRow
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return downloadData => statement.get(JSON.stringify(downloadData))
}
