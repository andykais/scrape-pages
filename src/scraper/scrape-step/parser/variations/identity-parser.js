export default config => ({ store }) => async ({
  downloadId,
  parentId,
  value
}) => {
  const nextParentId = store.insertBatchParsedValues(
    [undefined],
    parentId,
    downloadId
  )
  return { parsedValues: [value], parentId: nextParentId }
}
