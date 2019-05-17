import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'
import { Voidable } from '../../../../util/types'

type CacheId = number
type Statement = (params: {
  scraper: string
  protocol: string
  downloadData: any
  downloadValue: string
  mimeType: Voidable<string>
  filename: Voidable<string>
  byteLength: Voidable<number>
  failed: boolean
}) => CacheId
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)

  return ({
    scraper,
    protocol,
    downloadData,
    downloadValue,
    mimeType,
    filename,
    byteLength,
    failed
  }) => {
    const info = statement.run(
      scraper,
      protocol,
      JSON.stringify(downloadData),
      downloadValue,
      mimeType,
      filename,
      byteLength,
      +failed
    )
    return info.lastInsertRowid as CacheId
  }
}
