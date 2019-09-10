// type imports
import { Query } from '../src/scraper'

// were dealing with unpredictable insert order, so we just want to check if the keys exist or not
type Result = ReturnType<Query>
export const stripResult = (result: Result) =>
  result.map(g =>
    g.map(r => ({
      ...r,
      filename: typeof r.filename === 'string' ? true : false,
      id: typeof r.id === 'number' ? true : false
    }))
  )
