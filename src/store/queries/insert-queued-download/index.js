import SQL_TEMPLATE from './template.sql'

// TODO batch this call? (less readable but doable)
export default async (flatConfig, database) => {
  // const stmt = await database.prepare(SQL_TEMPLATE)
  return ({ scraper, parentId, loopIndex, incrementIndex, url }) => {
    return new Promise((resolve, reject) =>
      database.database.serialize(() =>
        database.database
          .exec('BEGIN TRANSACTION')
          .run(SQL_TEMPLATE, [
            scraper,
            parentId,
            loopIndex,
            incrementIndex,
            url
          ])
          .get(
            'SELECT id FROM downloads WHERE scraper = ? AND IFNULL(parseParentId, -1) = ? AND loopIndex = ? AND incrementIndex = ?',
            [scraper, parentId || -1, loopIndex, incrementIndex],
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
          .exec('COMMIT')
      )
    )
  }
}
