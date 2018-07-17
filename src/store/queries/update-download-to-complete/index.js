import SQL_TEMPLATE from './template.sql'

export default (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ downloadId, filename }) => {
    statement.run(filename, downloadId)
    // console.log(downloadId, 'completed download', filename)
    // return database.run(SQL_TEMPLATE, [filename, downloadId])
  }
}
