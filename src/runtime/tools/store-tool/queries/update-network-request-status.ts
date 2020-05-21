import { sql, Query } from './query-base'
import { Sqlite3 } from '@scrape-pages/types/internal'

const template = sql`
UPDATE networkRequests
SET
  responseValue = ?,
  filename = ?,
  byteLength = ?,
  status = ?
WHERE id = ?
`

const NetworkRequestStatusEnum = {
  QUEUED: 0,
  COMPLETE: 1,
  FAILED: 2
}

class UpdateNetworkRequestStatus extends Query {
  protected static template = template
  protected statement: Sqlite3.Statement

  public call = (
    requestId: number,
    responseValue: string | null,
    filename: string | null,
    byteLength: number | null,
    status: 'COMPLETE' | 'FAILED'
  ) => {
    // TODO verify statement.run(...).changes === 1
    this.statement.run(
      responseValue,
      filename,
      byteLength,
      NetworkRequestStatusEnum[status],
      requestId
    )
  }
}

export { UpdateNetworkRequestStatus }
