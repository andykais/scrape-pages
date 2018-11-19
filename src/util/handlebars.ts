import Handlebars from 'handlebars'

Handlebars.registerHelper('+', (x: number, y: number) => x + y)
Handlebars.registerHelper('-', (x: number, y: number) => x - y)
Handlebars.registerHelper('*', (x: number, y: number) => x * y)
Handlebars.registerHelper('/', (x: number, y: number) => x / y)

export const compileTemplate = (templateStr: string) => {
  const template = Handlebars.compile(templateStr, { noEscape: true })
  return (data: {}) => template(data)
}
