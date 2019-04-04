import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type Statement = (params: { cacheId: Voidable<number>; downloadId: number }) => void
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ cacheId, downloadId }) => {
    statement.run(cacheId, downloadId)
  }
}
