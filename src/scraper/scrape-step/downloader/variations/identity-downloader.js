export default config => (runParams, { emitter, store }) => async ({
  parentId,
  loopIndex,
  incrementIndex,
  value
}) => {
  const downloadId = store.insertQueuedDownload({
    scraper: config.name,
    parentId,
    loopIndex,
    incrementIndex
  })
  emitter.forScraper[config.name].emitQueuedDownload(downloadId)
  return { downloadValue: value, downloadId }
}
