import SQL_TEMPLATE from './template.sql'
import { CreateQuery } from '../../types'

type Statement = () => void
export const query: CreateQuery<Statement> = (flatConfig, database) => () => {
  database.pragma('foreign_keys = OFF')
  database.exec(SQL_TEMPLATE)
  database.pragma('foreign_keys = ON')
}
