import { sql, Query } from './query-base'
import { Sqlite3, Stream } from '@scrape-pages/types/internal'

const template = sql`
UPDATE crawlerTree
SET
  cacheId = ?,
  value = ?,
  complete = 1
WHERE id = ?
`

class UpdateValue extends Query {
  protected static template = template
  protected statement: Sqlite3.Statement

  // TODO add insert stuff into the cache because we want to store things like byte length and filename
  public call = (cacheId: undefined | number, payload: Stream.Payload) => {
    // TODO verify statement.run(...).changes === 1
    this.statement.run(cacheId, payload.value, payload.id)
  }
}

export { UpdateValue }
