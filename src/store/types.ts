import { Database } from './database'
import { FlatConfig } from '../configuration/site-traversal/types'

export type CreateQuery<StatementFunction extends Function> = (
  flatConfig: FlatConfig,
  database: Database
) => StatementFunction
