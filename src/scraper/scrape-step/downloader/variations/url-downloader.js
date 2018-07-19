import { resolve, basename } from 'path'
import { constructUrl } from '../construct-url'
import {
  downloadToFileAndMemory,
  downloadToMemoryOnly,
  downloadToFileOnly
} from '../fetchers'

export default config => (runParams, dependencies) => {
  const { store, queue, emitter } = dependencies

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
    const downloadId = store.insertQueuedDownload({
      scraper: config.name,
      parentId,
      loopIndex,
      incrementIndex,
      url: url.toString()
    })

    emitter.forScraper[config.name].emitQueuedDownload(downloadId)
    const { downloadValue, filename } = await fetcher(
      config,
      runParams,
      dependencies,
      downloadId,
      url
    )
    return { downloadValue, downloadId, filename }
  }
}
