import { Sqlite3 } from '@scrape-pages/types/internal'
import { CreateTables } from './create-tables'
import { InsertIncompleteValue } from './insert-incomplete-value'
import { InsertCommand } from './insert-command'
import { InsertValue } from './insert-value'
import { UpdateValue } from './update-value'
import { SelectOrderedLabeledValues } from './select-ordered-labeled-values'

type Queries = ReturnType<typeof createStatements>
function createStatements(database: Sqlite3.Database) {
  const createTables = new CreateTables(database)
  createTables.call()

  return {
    insertIncompleteValue: new InsertIncompleteValue(database).call,
    insertCommand: new InsertCommand(database).call,
    updateValue: new UpdateValue(database).call,
    selectOrderedLabeledValues: new SelectOrderedLabeledValues(database).call
  }
}

export {
  createStatements,
  // type exports
  Queries
}
