import * as Handlebars from 'handlebars'
import { Stream } from '@scrape-pages/types/internal'

// these are nicities so that inside configs we can do simple math expressions
// this can be particularly useful when incrementing download urls
Handlebars.registerHelper('+', (x: number, y: number) => x + y)
Handlebars.registerHelper('-', (x: number, y: number) => x - y)
Handlebars.registerHelper('*', (x: number, y: number) => x * y)
Handlebars.registerHelper('/', (x: number, y: number) => x / y)

type Template = (payload: Stream.Payload) => string
function compileTemplate(templateStr: string) {
  const template = Handlebars.compile(templateStr, { noEscape: true })
  // TODO remove id from payload?
  return (payload: Stream.Payload) => {
    const index = payload.operatorIndex
    const value = payload.value
    const inputs = payload.inputs
    return template({ ...inputs, index, value })
  }
}

export {
  compileTemplate,
  // type exports
  Template,
}
