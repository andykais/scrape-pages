import { sql, Query } from './query-base'
import { Sqlite3, Stream } from '@scrape-pages/types/internal'

const template = sql`
INSERT INTO commands (
  label
) VALUES (?)
`

class InsertCommand extends Query {
  protected static template = template
  protected statement: Sqlite3.Statement

  public call = (label: string | undefined) => {
    const info = this.statement.run(label)
    return info.lastInsertRowid as Stream.Id
  }
}

export { InsertCommand }
