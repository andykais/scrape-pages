import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type Statement = (params: { downloadId: number; filename: string }) => void
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ downloadId, filename }) => {
    statement.run(filename, downloadId)
  }
}
