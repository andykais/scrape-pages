export default config => ({ emitter }, { store }) => async ({
  parentId,
  loopIndex,
  incrementIndex,
  value
}) => {
  const downloadId = await store.insertQueuedDownload({
    scraper: config.name,
    parentId,
    loopIndex,
    incrementIndex
  })
  emitter.forScraper[config.name].emitQueuedDownload(downloadId)
  return { downloadValue: value, downloadId }
}
