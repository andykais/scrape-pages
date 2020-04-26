import { sql, Query } from './query-base'
import { Sqlite3, Stream } from '@scrape-pages/types/internal'
import { ProgramStateEnum } from '@scrape-pages/runtime/scraper-program'

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

  public call = (state: ProgramStateEnum) => {
    const info = this.statement.run(VERSION, state, state, state)
    if (info.changes === 0) {
      throw new Error(`Cannot set scraper to ${state} when it is already in the ${state} state.`)
    }
  }
}

export { UpdateProgramState }
