import { sql, Query } from './query-base'
import { RuntimeState, Sqlite3 } from '@scrape-pages/types/internal'

const template = sql`
INSERT INTO programState
  (Lock, version, state)
VALUES
  (1, ?, ?)
ON CONFLICT (Lock)
DO UPDATE
SET
  state = ?
WHERE
  state NOT IN (?, 'ERRORED')
`

class UpdateProgramState extends Query {
  protected static template = template
  protected statement: Sqlite3.Statement

  public call = (state: RuntimeState) => {
    const info = this.statement.run(VERSION, state, state, state)
    if (info.changes === 0) {
      throw new Error(
        `Cannot set scraper to ${state} when it is already in the ${state} state or it is ERRORED.`
      )
    }
  }
}

export { UpdateProgramState }
