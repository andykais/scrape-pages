import { DownloaderType } from '../'

export const downloader: DownloaderType = config => (
  runParams,
  { emitter, store }
) => ({ parentId, loopIndex, incrementIndex, value }) => {
  const downloadId = store.qs.insertQueuedDownload({
    scraper: config.name,
    parentId,
    loopIndex,
    incrementIndex
  })
  emitter.forScraper[config.name].emitQueuedDownload(downloadId)
  return { downloadValue: value, downloadId, filename: null }
}
