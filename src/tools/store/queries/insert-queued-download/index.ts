import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type Statement = (
  scraper: string,
  params: {
    parentId?: number
    incrementIndex: number
  },
  downloadData: any
) => number
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return (scraper, { parentId, incrementIndex }, downloadData) => {
    const info = statement.run(scraper, parentId, incrementIndex, JSON.stringify(downloadData))
    return info.lastInsertRowid as number
  }
}
