import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type Statement = (
  params: {
    scraper: string
    parentId?: number
    downloadId: number
    parsedValues: string[]
    format: string
    // parsedValues: string[] | [string | undefined]
  }
) => void
export const query: CreateQuery<Statement> = (flatConfig, database) => {
  const statement = database.prepare(SQL_TEMPLATE)

  return database.transaction((({ scraper, parentId, downloadId, parsedValues, format }) => {
    for (let parseIndex = 0; parseIndex < parsedValues.length; parseIndex++) {
      const parsedValue = parsedValues[parseIndex]
      statement.run(scraper, parentId, downloadId, parseIndex, parsedValue, format)
    }
  }) as Statement)
}
