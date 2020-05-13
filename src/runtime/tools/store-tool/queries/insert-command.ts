import { sql, Query } from './query-base'
// type imports
import { Sqlite3, Stream } from '@scrape-pages/types/internal'

const template = sql`
INSERT INTO commands (
  label
) VALUES (?)

-- INSERT OR IGNORE INTO "commands"(label) VALUES(?);
-- SELECT id FROM "Values" WHERE data = 'SOME_DATA';

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
