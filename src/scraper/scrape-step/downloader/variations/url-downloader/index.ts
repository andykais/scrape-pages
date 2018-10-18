import { resolve, basename } from 'path'
import { constructFetch } from './construct-url'
import {
  downloadToFileAndMemory,
  downloadToMemoryOnly,
  downloadToFileOnly
} from './fetchers'
import { DownloaderType } from '../../'

export const downloader: DownloaderType = config => (
  runParams,
  dependencies
) => {
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

  return async downloadParams => {
    const { value, parentId, loopIndex, incrementIndex } = downloadParams
    const { url, fetchOptions } = constructFetch(
      config,
      runParams,
      downloadParams
    )
    const downloadId = store.qs.insertQueuedDownload({
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
      {
        downloadId,
        url,
        fetchOptions
      }
    )
    return { downloadValue, downloadId, filename }
  }
}
