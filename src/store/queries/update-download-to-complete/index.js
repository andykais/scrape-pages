import SQL_TEMPLATE from './template.sql'

export default (flatConfig, database) => {
  return ({ downloadId, filename }) =>
    console.log(downloadId, 'completed download')
    database.run(SQL_TEMPLATE, {
      $filename: filename,
      $downloadId: downloadId
    })
}
