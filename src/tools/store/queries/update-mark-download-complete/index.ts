import SQL_TEMPLATE from './template.sql'
// type imports
import { CreateQuery } from '../../types'
import { Voidable } from '../../../../util/types'

type Statement = (params: { cacheId: Voidable<number>; downloadId: number }) => void
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ cacheId, downloadId }) => {
    // TODO verify statement.run(...).changes === 1
    statement.run(cacheId, downloadId)
  }
}
