import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type SelectedRow = number | undefined
type Statement = (
  params: {
    incrementIndex: number
    parentId?: number
    scraper: string
  }
) => SelectedRow
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ incrementIndex, parentId = -1, scraper }) => {
    const { id } = statement.get([incrementIndex, parentId, scraper]) || { id: undefined }
    return id
  }
}
