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
  return (payload: Stream.Payload) => {
    const { operatorIndex: index, value, inputs, userSetVars } = payload
    return template({ ...inputs, ...userSetVars, index, value })
  }
}

export {
  compileTemplate,
  // type exports
  Template,
}
