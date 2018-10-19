import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type SelectedRow = {
  id: number,
  parsedValue?: string
}
type Statement = (downloadId: number) => SelectedRow[]
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return downloadId => statement.all(downloadId)
}
