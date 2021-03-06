import { sql, Query } from './query-base'
import { Sqlite3, Stream } from '@scrape-pages/types/internal'

const template = sql`
INSERT INTO crawlerTree (
  commandId,
  parentTreeId,
  operatorIndex,
  valueIndex,
  value,
  networkRequestId
) VALUES (?, ?, ?, ?, ?, ?)
`

class InsertValue extends Query {
  protected static template = template
  protected statement: Sqlite3.Statement

  public call = (
    commandId: number,
    parentPayload: Stream.Payload,
    valueIndex: number,
    value: string,
    requestId?: number
  ) => {
    // -1 is special because it comes from the 'fake' initialValue
    const parentId = parentPayload.id === -1 ? null : parentPayload.id
    const info = this.statement.run(
      commandId,
      parentId,
      parentPayload.operatorIndex,
      valueIndex,
      value,
      requestId
    )
    return info.lastInsertRowid as number
  }
}

export { InsertValue }
