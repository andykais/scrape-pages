import { Database } from '@scrape-pages/types/internal'
import { CreateTables } from './create-tables'

function createStatements(database: Database) {
  return {
    createTables: new CreateTables(database).call
  }
}

type Queries = ReturnType<typeof createStatements>

export { createStatements }
// type exports
export { Queries }
