// type imports
import { QueryResult } from '../src'

export const stripResult = (result: QueryResult) =>
  result.map(g =>
    g.map(r => ({
      ...r,
      filename: typeof r.filename === 'string' ? true : false,
      id: typeof r.id === 'number' ? true : false
    }))
  )
