import SQL_TEMPLATE from './template.sql'

export default (flatConfig, database) => {
  return ({ downloadId, filename }) => {
    // console.log(downloadId, 'completed download', filename)
    return database.run(SQL_TEMPLATE, [filename, downloadId])
  }
}
