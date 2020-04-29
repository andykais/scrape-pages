import { Sqlite3 } from '@scrape-pages/types/internal'
import { CreateTables } from './create-tables'
import { TruncateTables } from './truncate-tables'
import { InsertCommand } from './insert-command'
import { SelectOrderedLabeledValues } from './select-ordered-labeled-values'
import { SelectCommands } from './select-commands'
import { InsertValue } from './insert-value'
import { InsertQueuedNetworkRequest } from './insert-queued-network-request'
import { UpdateNetworkRequestStatus } from './update-network-request-status'
import { CheckProgramVersion } from './check-program-version'
import { UpdateProgramState } from './update-program-state'
import { SelectNetworkRequestValue } from './select-network-request-value'

type Queries = ReturnType<typeof createStatements>
function createStatements(database: Sqlite3.Database) {
  return {
    truncateTables: new TruncateTables(database).call,
    checkProgramVersion: new CheckProgramVersion(database).call,
    updateProgramState: new UpdateProgramState(database).call,
    insertCommand: new InsertCommand(database).call,
    selectCommands: new SelectCommands(database).call,
    selectOrderedLabeledValues: new SelectOrderedLabeledValues(database).call,
    insertValue: new InsertValue(database).call,
    insertQueuedNetworkRequest: new InsertQueuedNetworkRequest(database).call,
    updateNetworkRequestStatus: new UpdateNetworkRequestStatus(database).call,
    selectNetworkRequestValue: new SelectNetworkRequestValue(database).call
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
