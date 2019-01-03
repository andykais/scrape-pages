import { Database } from '../database'
import { FlatConfig } from '../../configuration/site-traversal/types'

export { query as createTables } from './create-tables'
import { query as selectOrderedScrapers } from './select-ordered-scrapers'
import { query as selectCompletedDownload } from './select-completed-download'
import { query as insertQueuedDownload } from './insert-queued-download'
import { query as updateDownloadToComplete } from './update-download-to-complete'
import { query as insertBatchParsedValues } from './insert-batch-parsed-values'
import { query as selectParsedValues } from './select-parsed-values'

export const createStatements = (
  flatConfig: FlatConfig,
  database: Database
) => ({
  selectOrderedScrapers: selectOrderedScrapers(flatConfig, database),
  selectCompletedDownload: selectCompletedDownload(flatConfig, database),
  insertQueuedDownload: insertQueuedDownload(flatConfig, database),
  updateDownloadToComplete: updateDownloadToComplete(flatConfig, database),
  insertBatchParsedValues: insertBatchParsedValues(flatConfig, database),
  selectParsedValues: selectParsedValues(flatConfig, database),
  // util statements
  beginTransaction: database.prepare('BEGIN TRANSACTION'),
  commitTransaction: database.prepare('COMMIT'),
  rollbackTransaction: database.prepare('ROLLBACK')
})
