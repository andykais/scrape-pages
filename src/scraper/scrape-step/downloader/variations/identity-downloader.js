export default config => ({ emitter }, { store }) => async ({
  parentId,
  loopIndex,
  incrementIndex,
  value
}) => {
  const downloadId = store.asTransaction(() => {
    store.insertQueuedDownload({
      scraper: config.name,
      parentId,
      loopIndex,
      incrementIndex
    })
    const { id } = store.selectQueuedDownload({
      scraper: config.name,
      parentId,
      loopIndex,
      incrementIndex
    })
    return id
  })
  emitter.forScraper[config.name].emitQueuedDownload(downloadId)
  return { downloadValue: value, downloadId }
}
