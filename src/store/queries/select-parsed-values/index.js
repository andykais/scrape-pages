import SQL_TEMPLATE from './template.sql'

export default (flatConfig, database) => {
  return downloadId => database.all(SQL_TEMPLATE, [downloadId])
}
