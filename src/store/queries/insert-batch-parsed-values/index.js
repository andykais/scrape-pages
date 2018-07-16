import format from 'string-template'
import SQL_TEMPLATE from './template.sql'

export default (flatConfig, database) => {
  return ({ name, parentId, downloadId, parsedValues }) => {
    // console.log(name, 'insert', parsedValues.length, 'values')

    if (!parsedValues.length) return []

    const valuesString = Array(parsedValues.length)
      .fill('(?, ?, ?, ?, ?)')
      .join(',')
    const insertBatchParsedValuesSql = format(SQL_TEMPLATE, {
      values: valuesString
    })
    const insertRows = parsedValues.reduce(
      (acc, parsedValue, parseIndex) =>
        acc.concat([name, parentId, downloadId, parseIndex, parsedValue]),
      []
    )
    return database.run(insertBatchParsedValuesSql, insertRows)
  }
}
