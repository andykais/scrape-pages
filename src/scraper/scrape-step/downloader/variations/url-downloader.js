import { resolve, basename } from 'path'
import sanitize from 'sanitize-filename'
import format from 'string-template'
import { constructUrl } from '../construct-url'
import {
  downloadToFileAndMemory,
  downloadToMemoryOnly,
  downloadToFileOnly,
  readFromFile
} from '../fetchers'

const sanitizeUrl = url => sanitize(url.toString(), { replacement: '_' })

export default config => (runParams, dependencies) => {
  const { store, queue } = dependencies

  const shouldDownloadToMemory = Boolean(
    config.scrapeEach.length || config.parse
  )
  const shouldDownloadToFile = runParams.cache

  const fetcher =
    shouldDownloadToMemory && shouldDownloadToFile
      ? downloadToFileAndMemory
      : shouldDownloadToMemory
        ? downloadToMemoryOnly
        : downloadToFileOnly

  return async ({ value, parentId, loopIndex, incrementIndex }) => {
    const url = constructUrl(config, runParams, {
      value,
      incrementIndex
    })
    const downloadId = await store.insertQueuedDownload({
      scraper: config.name,
      parentId,
      loopIndex,
      incrementIndex,
      url: url.toString()
    })
    const { downloadValue, filename } = await fetcher(
      runParams,
      dependencies,
      url
    )
    return { downloadValue, downloadId, filename }
  }
}
