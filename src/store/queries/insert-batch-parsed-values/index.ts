import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type Statement = (
  params: {
    name: string
    parentId?: number
    downloadId: number
    parsedValues: string[]
  }
) => void
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)
  return ({ name, parentId, downloadId, parsedValues }) => {
    for (let parseIndex = 0; parseIndex < parsedValues.length; parseIndex++) {
      const parsedValue = parsedValues[parseIndex]
      statement.run(name, parentId, downloadId, parseIndex, parsedValue)
    }
  }
}
