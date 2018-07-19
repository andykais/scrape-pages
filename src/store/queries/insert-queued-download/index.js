import SQL_TEMPLATE from './template.sql'

// TODO batch this call? (less readable but doable)
export default (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ scraper, parentId, loopIndex, incrementIndex, url }) => {
    const info = statement.run(
      scraper,
      parentId,
      loopIndex,
      incrementIndex,
      url
    )
    return info.lastInsertROWID
  }
}
