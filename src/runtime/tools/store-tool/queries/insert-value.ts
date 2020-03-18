import { sql, Query } from './query-base'
import { Sqlite3, Stream } from '@scrape-pages/types/internal'

const template = sql`
INSERT INTO crawlerTree (
  commandId,
  parentTreeId,
  operatorIndex,
  valueIndex,
  value
  complete
) VALUES (?, ?, ?, ?, ?, 1)
`

class InsertValue extends Query {
  protected static template = template
  protected statement: Sqlite3.Statement

  public call = (downloadId: number, parentPayload: Stream.Payload, valueIndex: number) => {
    console.log({
      downloadId,
      parentPayload,
      valueIndex
    })
    const info = this.statement.run(
      downloadId,
      parentPayload.id,
      parentPayload.operatorIndex,
      valueIndex
    )
    return info.lastInsertRowid
  }
}

export { InsertValue }
