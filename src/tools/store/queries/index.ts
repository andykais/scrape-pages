// type imports
import { Database } from '../database'
import { FlatConfig } from '../../../settings/config/types'

export { query as createTables } from './create-tables'
export { query as selectOrderedScrapers } from './select-ordered-scrapers'
import { query as selectOrderedScrapers } from './select-ordered-scrapers'
import { query as selectCompletedDownloadId } from './select-completed-download-id'
import { query as selectMatchingDownloadId } from './select-matching-download-id'
import { query as insertQueuedDownload } from './insert-queued-download'
import { query as updateDownloadToComplete } from './update-download-to-complete'
import { query as updateCompletedDownloadToQueued } from './update-completed-download-to-queued'
import { query as insertBatchParsedValues } from './insert-batch-parsed-values'
import { query as selectParsedValues } from './select-parsed-values'
import { query as deleteParsedValuesOnDownloadId } from './delete-parsed-values-on-download-id'
import { query as insertDownloadCache } from './insert-download-cache'
import { query as insertDownloadRecord } from './insert-download-record'
import { query as selectMatchingCachedDownload } from './select-matching-cached-download'
import { query as updateMarkDownloadComplete } from './update-mark-download-complete'

export const createStatements = (flatConfig: FlatConfig, database: Database) => ({
  insertQueuedDownload: insertQueuedDownload(flatConfig, database),
  selectMatchingCachedDownload: selectMatchingCachedDownload(flatConfig, database),
  insertDownloadCache: insertDownloadCache(flatConfig, database),
  updateMarkDownloadComplete: updateMarkDownloadComplete(flatConfig, database),
  // insertDownloadRecord: insertDownloadRecord(flatConfig, database),
  // selectOrderedScrapers: selectOrderedScrapers(flatConfig, database),
  // selectCompletedDownloadId: selectCompletedDownloadId(flatConfig, database),
  // selectMatchingDownloadId: selectMatchingDownloadId(flatConfig, database),
  // updateDownloadToComplete: updateDownloadToComplete(flatConfig, database),
  // updateCompletedDownloadToQueued: updateCompletedDownloadToQueued(flatConfig, database),
  insertBatchParsedValues: insertBatchParsedValues(flatConfig, database),
  selectParsedValues: selectParsedValues(flatConfig, database),
  // deleteParsedValuesOnDownloadId: deleteParsedValuesOnDownloadId(flatConfig, database),
})
