import SQL_TEMPLATE from './template.sql'

// TODO batch this call? (less readable but doable)
export default async (flatConfig, database) => {
  // const stmt = await database.prepare(SQL_TEMPLATE)
  return ({ scraper, parentId, loopIndex, incrementIndex, url }) => {
    return database.run(SQL_TEMPLATE, [
      scraper,
      parentId,
      loopIndex,
      incrementIndex,
      url
    ])
  }
}
