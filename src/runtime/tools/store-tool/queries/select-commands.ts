import { sql, Query } from './query-base'
import { Sqlite3 } from '@scrape-pages/types/internal'

const template = sql`
SELECT label, id FROM commands
`

type SelectedRow = {
  label: string | null
  id: number
}

class SelectCommands extends Query {
  protected static template = template
  protected statement: Sqlite3.Statement

  public call = (): SelectedRow[] => {
    return this.statement.all()
  }
}

export {
  SelectCommands,
  // type exports
  SelectedRow
}
