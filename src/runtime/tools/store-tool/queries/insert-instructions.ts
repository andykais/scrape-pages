import { sql, Query } from './query-base'
// type imports
import { Instructions } from '@scrape-pages/types/instructions'
import { Sqlite3, Stream } from '@scrape-pages/types/internal'

const template = sql`
INSERT INTO instructions (
  instructionsJson
) VALUES (?)
`

class InsertInstructions extends Query {
  protected static template = template
  protected statement: Sqlite3.Statement

  public call = (instructions: Instructions) => {
    const instructionsSerialized = JSON.stringify(instructions)
    const info = this.statement.run(instructionsSerialized)
    return info.lastInsertRowid as Stream.Id
  }
}

export { InsertInstructions }
