import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type Statement = (params: { scraper: string; parentId?: number; incrementIndex: number }) => number
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ scraper, parentId, incrementIndex }) => {
    const info = statement.run(scraper, parentId, incrementIndex)
    return info.lastInsertRowid as number
  }
}
