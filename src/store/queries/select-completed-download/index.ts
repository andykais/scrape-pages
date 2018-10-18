import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type SelectedRow = { id?: number }
type Statement = (
  params: {
    incrementIndex: number
    loopIndex?: number
    parentId?: number
    scraper: string
  }
) => SelectedRow
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ incrementIndex, loopIndex = 0, parentId = -1, scraper }) => {
    return statement.get([loopIndex, incrementIndex, parentId, scraper]) || {}
  }
}
