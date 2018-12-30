import { DownloaderType } from '../'

export const downloader: DownloaderType = config => (
  runParams,
  { emitter, store }
) => ({ parentId, scrapeNextIndex, incrementIndex, value }) => {
  const downloadId = store.qs.insertQueuedDownload({
    scraper: config.name,
    parentId,
    scrapeNextIndex,
    incrementIndex
  })
  emitter.forScraper[config.name].emitQueuedDownload(downloadId)
  return { downloadValue: value, downloadId, filename: null }
}
