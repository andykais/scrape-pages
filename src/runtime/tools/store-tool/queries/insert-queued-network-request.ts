import { sql, Query } from './query-base'
import { Sqlite3 } from '@scrape-pages/types/internal'

const template = sql`
INSERT INTO networkRequests (
  commandId,
  requestParams,
  status
) VALUES (?, ?, ?)
`

const NetworkRequestStatusEnum = {
  QUEUED: 'QUEUED' as const,
  COMPLETE: 'COMPLETE' as const,
  FAILED: 'FAILED' as const
}

class InsertQueuedNetworkRequest extends Query {
  protected static template = template
  protected statement: Sqlite3.Statement

  public call = (commandId: number, requestParams: string) => {
    const info = this.statement.run(commandId, requestParams, NetworkRequestStatusEnum.QUEUED)
    return info.lastInsertRowid as number
  }
}

export { InsertQueuedNetworkRequest }
