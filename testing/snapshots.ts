// type imports
import { Query } from '../src/scraper'

type Result = ReturnType<Query>
export const stripResult = (result: Result) =>
  result.map(g =>
    g.map(r => ({
      ...r,
      filename: typeof r.filename === 'string' ? true : false,
      id: typeof r.id === 'number' ? true : false
    }))
  )
