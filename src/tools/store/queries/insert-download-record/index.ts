import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type CacheId = number
type DownloadId = number
type Statement = (
  params: {
    scraper: string
    parentId: Voidable<string>
    incrementIndex: number
    cacheId: Voidable<CacheId>
  }
) => DownloadId
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)

  return ({ scraper, parentId, incrementIndex, cacheId }) => {
    const info = statement.run(scraper, parentId, incrementIndex, cacheId)
    return info.lastInsertRowid as DownloadId
  }
}
