import SQL_TEMPLATE from './template.sql'

export default async (flatConfig, database) => {
  const stmt = await database.prepare(SQL_TEMPLATE)
  return async ({ incrementIndex, loopIndex = 0, parentId = -1 }) => {
    const result = await database.get(SQL_TEMPLATE, [
      loopIndex,
      incrementIndex,
      parentId
    ])
    return result || {}
  }
}
