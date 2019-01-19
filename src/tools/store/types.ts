import { Database } from './database'
import { FlatConfig } from '../../settings/config/types'

export type CreateQuery<StatementFunction extends Function> = (
  flatConfig: FlatConfig,
  database: Database
) => StatementFunction
