import { Sqlite3 } from '@scrape-pages/types/internal'
import { CreateTables } from './create-tables'
import { InsertCommand } from './insert-command'
import { UpdateValue } from './update-value'
import { SelectOrderedLabeledValues } from './select-ordered-labeled-values'
import { InsertValue } from './insert-value'
import { InsertQueuedNetworkRequest } from './insert-queued-network-request'
import { UpdateNetworkRequestStatus } from './update-network-request-status'

type Queries = ReturnType<typeof createStatements>
function createStatements(database: Sqlite3.Database) {
  const createTables = new CreateTables(database)
  createTables.call()

  return {
    insertCommand: new InsertCommand(database).call,
    // updateValue: new UpdateValue(database).call,
    selectOrderedLabeledValues: new SelectOrderedLabeledValues(database).call,
    insertValue: new InsertValue(database).call,
    insertQueuedNetworkRequest: new InsertQueuedNetworkRequest(database).call,
    updateNetworkRequestStatus: new UpdateNetworkRequestStatus(database).call
  }
}

export {
  createStatements,
  // type exports
  Queries
}
