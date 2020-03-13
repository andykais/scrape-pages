import { Database } from '@scrape-pages/types/internal'

function sql(strings: TemplateStringsArray, ...vars: string[]) {
  if (vars.length === 0) return strings[0]

  let str = ''
  for (let i = 0; i < strings.length; i++) {
    str += strings[i] + vars[i]
  }
  return str
}

class Query {
  public constructor(protected database: Database) {}
}


export { sql, Query }
