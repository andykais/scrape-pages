import DB from './database'
import { FlatConfig } from '../configuration/types'

export type CreateQuery<StatementFunction extends Function> = (
  flatConfig: FlatConfig,
  database: DB
) => StatementFunction
