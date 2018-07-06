export default config => ({ store }) => async ({ value }) => {
  const downloadId = await store.insertQueuedDownload()
  return { downloadId, value }
}
