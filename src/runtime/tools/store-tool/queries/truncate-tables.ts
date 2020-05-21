import { sql, Query } from './query-base'

const template = sql`
DELETE FROM commands;
DELETE FROM crawlerTree;
DELETE FROM networkRequests WHERE status = 'QUEUED'
`

class TruncateTables extends Query {
  public call = () => {
    this.database.pragma('foreign_keys = OFF')
    this.database.exec(template)
    this.database.pragma('foreign_keys = ON')
  }
}

export { TruncateTables }
