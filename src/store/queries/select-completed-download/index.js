import SQL_TEMPLATE from './template.sql'

export default (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ incrementIndex, loopIndex = 0, parentId = -1, scraper }) => {
    return statement.get([loopIndex, incrementIndex, parentId, scraper]) || {}
  }
}
