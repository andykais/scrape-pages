import format from 'string-template'
import SQL_TEMPLATE from './template.sql'

export default (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ name, parentId, downloadId, parsedValues }) => {
    for (let parseIndex = 0; parseIndex < parsedValues.length; parseIndex++) {
      const parsedValue = parsedValues[parseIndex]
      statement.run(name, parentId, downloadId, parseIndex, parsedValue)
    }
    // return
    // // console.log(name, 'insert', parsedValues.length, 'values')

    // if (!parsedValues.length) return []

    // const valuesString = Array(parsedValues.length)
    // .fill('(?, ?, ?, ?, ?)')
    // .join(',')
    // const insertBatchParsedValuesSql = format(SQL_TEMPLATE, {
    // values: valuesString
    // })
    // const insertRows = parsedValues.reduce(
    // (acc, parsedValue, parseIndex) =>
    // acc.concat([name, parentId, downloadId, parseIndex, parsedValue]),
    // []
    // )
    // return database.run(insertBatchParsedValuesSql, insertRows)
  }
}
