import { sql, Query } from './query-base'
import { Sqlite3, Models } from '@scrape-pages/types/internal'

const template = sql`
SELECT id, responseValue from networkRequests
WHERE requestParams = ? AND status != 'FAILED'
`

type SelectedRow = {
  id: number
  status: Models.NetworkRequest.Status
  responseValue: string
}

class SelectNetworkRequestValue extends Query {
  protected static template = template
  protected statement: Sqlite3.Statement

  public call = (serializedRequestParams: string): SelectedRow => {
    return this.statement.get(serializedRequestParams)
  }
}

export {
  SelectNetworkRequestValue,
  // type exports
  SelectedRow,
}
