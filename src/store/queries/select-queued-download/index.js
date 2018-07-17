import SQL_TEMPLATE from './template.sql'

export default (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ scraper, parentId, loopIndex, incrementIndex, url }) => {
    return statement.get(scraper, parentId || -1, loopIndex, incrementIndex)
  }
}
