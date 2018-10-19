import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type Statement = (
  params: {
    scraper: string
    parentId?: number
    loopIndex: number
    incrementIndex: number
    url?: string
  }
) => number
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  // TODO batch this call? (less readable but doable)
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ scraper, parentId, loopIndex, incrementIndex, url }) => {
    const info = statement.run(
      scraper,
      parentId,
      loopIndex,
      incrementIndex,
      url
    )
    return info.lastInsertROWID as number
  }
}
