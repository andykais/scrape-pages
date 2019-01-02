import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type Statement = (
  scraper: string,
  params: {
    parentId?: number
    scrapeNextIndex: number
    incrementIndex: number
  },
  downloadData: {}
) => number
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  // TODO batch this call? (less readable but doable)
  const statement = database.prepare(SQL_TEMPLATE)
  return (
    scraper,
    { parentId, scrapeNextIndex, incrementIndex },
    downloadData
  ) => {
    const info = statement.run(
      scraper,
      parentId,
      scrapeNextIndex,
      incrementIndex,
      JSON.stringify(downloadData)
    )
    return info.lastInsertROWID as number
  }
}
