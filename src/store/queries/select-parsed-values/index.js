import SQL_TEMPLATE from './template.sql'

export default (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return downloadId => statement.all(downloadId)
}
