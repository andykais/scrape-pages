import * as Handlebars from 'handlebars'

// these are nicities so that inside configs we can do simple math expressions
// this can be particularly useful when incrementing download urls
Handlebars.registerHelper('+', (x: number, y: number) => x + y)
Handlebars.registerHelper('-', (x: number, y: number) => x - y)
Handlebars.registerHelper('*', (x: number, y: number) => x * y)
Handlebars.registerHelper('/', (x: number, y: number) => x / y)

export const compileTemplate = (templateStr: string) => {
  const template = Handlebars.compile(templateStr, { noEscape: true })
  return (data: {} = {}) => template(data)
}
