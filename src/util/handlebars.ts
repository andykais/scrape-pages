import * as Handlebars from 'handlebars'

// these are nicities so that inside configs we can do simple math expressions
// this can be particularly useful when incrementing download urls
Handlebars.registerHelper('+', (x: number, y: number) => x + y)
Handlebars.registerHelper('-', (x: number, y: number) => x - y)
Handlebars.registerHelper('*', (x: number, y: number) => x * y)
Handlebars.registerHelper('/', (x: number, y: number) => x / y)

type Template = HandlebarsTemplateDelegate<any>
function compileTemplate(templateStr: string): Template {
  const template = Handlebars.compile(templateStr, { noEscape: true })
  return template
  // return (data: {} = {}) => template(data)
}

export {
  compileTemplate,
  // type exports
  Template
}
