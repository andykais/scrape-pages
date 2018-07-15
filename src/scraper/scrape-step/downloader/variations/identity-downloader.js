export default config => (runParams, { store }) => async ({
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
  return { downloadValue: value, downloadId }
}
