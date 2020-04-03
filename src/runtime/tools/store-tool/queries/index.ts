import { Sqlite3 } from '@scrape-pages/types/internal'
import { CreateTables } from './create-tables'
// import { InsertInstructions } from './insert-instructions.ts'
import { InsertCommand } from './insert-command'
import { UpdateValue } from './update-value'
import { SelectOrderedLabeledValues } from './select-ordered-labeled-values'
import { SelectCommands } from './select-commands'
import { InsertValue } from './insert-value'
import { InsertQueuedNetworkRequest } from './insert-queued-network-request'
import { UpdateNetworkRequestStatus } from './update-network-request-status'

type Queries = ReturnType<typeof createStatements>
function createStatements(database: Sqlite3.Database) {
  return {
    insertCommand: new InsertCommand(database).call,
    // insertInstructions: new InsertInstructions(database).call,
    // updateValue: new UpdateValue(database).call,
    selectCommands: new SelectCommands(database).call,
    selectOrderedLabeledValues: new SelectOrderedLabeledValues(database).call,
    insertValue: new InsertValue(database).call,
    insertQueuedNetworkRequest: new InsertQueuedNetworkRequest(database).call,
    updateNetworkRequestStatus: new UpdateNetworkRequestStatus(database).call
  }
}

function initializeTables(database: Sqlite3.Database) {
  const createTables = new CreateTables(database)
  createTables.call()
}

export {
  createStatements,
  initializeTables,
  // type exports
  Queries
}
