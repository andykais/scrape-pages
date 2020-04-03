import { Sqlite3 } from '@scrape-pages/types/internal'

function sql(strings: TemplateStringsArray, ...vars: (string | number)[]) {
  let str = ''
  for (let i = 0; i < strings.length; i++) {
    if (vars.length > i) str += strings[i] + vars[i]
    else str += strings[i]
  }
  return str
}

class Query {
  protected static template?: string
  protected statement: Sqlite3.Statement | undefined

  public constructor(protected database: Sqlite3.Database) {
    const maybeTemplate: string | undefined = (this as any).constructor.template
    if (maybeTemplate) {
      this.statement = this.database.prepare(maybeTemplate)
    }
  }
}

export { sql, Query }
