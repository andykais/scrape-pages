import format from 'string-template'
import SQL_TEMPLATE from './template.sql'

export default (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ name, parentId, downloadId, parsedValues }) => {
    for (let parseIndex = 0; parseIndex < parsedValues.length; parseIndex++) {
      const parsedValue = parsedValues[parseIndex]
      statement.run(name, parentId, downloadId, parseIndex, parsedValue)
    }
  }
}
