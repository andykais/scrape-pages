export default setupParams => runParams => async ({ value }) => {
  const downloadId = await setupParams.store.insertQueuedDownload()
  return { downloadId, value }
}
