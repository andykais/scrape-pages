export default ({ config, store }) => runParams => async ({
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
