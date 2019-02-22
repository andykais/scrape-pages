// type imports
import { Database } from '../database'
import { FlatConfig } from '../../../settings/config/types'

export { query as createTables } from './create-tables'
export { query as selectOrderedScrapers } from './select-ordered-scrapers'
import { query as selectOrderedScrapers } from './select-ordered-scrapers'
import { query as selectCompletedDownload } from './select-completed-download'
import { query as insertQueuedDownload } from './insert-queued-download'
import { query as updateDownloadToComplete } from './update-download-to-complete'
import { query as insertBatchParsedValues } from './insert-batch-parsed-values'
import { query as selectParsedValues } from './select-parsed-values'

export const createStatements = (flatConfig: FlatConfig, database: Database) => ({
  selectOrderedScrapers: selectOrderedScrapers(flatConfig, database),
  selectCompletedDownload: selectCompletedDownload(flatConfig, database),
  insertQueuedDownload: insertQueuedDownload(flatConfig, database),
  updateDownloadToComplete: updateDownloadToComplete(flatConfig, database),
  insertBatchParsedValues: insertBatchParsedValues(flatConfig, database),
  selectParsedValues: selectParsedValues(flatConfig, database)
})
