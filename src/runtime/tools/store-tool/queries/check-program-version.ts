import { sql, Query } from './query-base'
import { Sqlite3, Stream } from '@scrape-pages/types/internal'

const template = sql`SELECT * FROM programState`

class CheckProgramVersion extends Query {
  protected static template = template
  protected statement: Sqlite3.Statement

  public call = () => {
    const row = this.statement.get()
    if (row === undefined) return
    const { version } = row
    if (version !== VERSION) {
      throw new Error(
        `Version mismatch. Cannot run version ${VERSION} on a database from version ${version}`
      )
    }
  }
}
export { CheckProgramVersion }
