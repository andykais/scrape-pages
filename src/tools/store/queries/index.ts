// type imports
import { Database } from '../database'
import { FlatConfig } from '../../../settings/config/types'

export { query as createTables } from './create-tables'
export { query as selectOrderedScrapers } from './select-ordered-scrapers'
import { query as selectMatchingCachedDownload } from './select-matching-cached-download'
import { query as selectParsedValues } from './select-parsed-values'
import { query as insertQueuedDownload } from './insert-queued-download'
import { query as insertDownloadCache } from './insert-download-cache'
import { query as insertBatchParsedValues } from './insert-batch-parsed-values'
import { query as updateMarkDownloadComplete } from './update-mark-download-complete'

export const createStatements = (flatConfig: FlatConfig, database: Database) => ({
  selectMatchingCachedDownload: selectMatchingCachedDownload(flatConfig, database),
  selectParsedValues: selectParsedValues(flatConfig, database),
  insertQueuedDownload: insertQueuedDownload(flatConfig, database),
  insertDownloadCache: insertDownloadCache(flatConfig, database),
  insertBatchParsedValues: insertBatchParsedValues(flatConfig, database),
  updateMarkDownloadComplete: updateMarkDownloadComplete(flatConfig, database)
})
