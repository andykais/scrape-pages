import Handlebars from 'handlebars'

Handlebars.registerHelper('+', (x: number, y: number) => x + y)
Handlebars.registerHelper('-', (x: number, y: number) => x - y)
Handlebars.registerHelper('*', (x: number, y: number) => x * y)
Handlebars.registerHelper('/', (x: number, y: number) => x / y)

export default (templateStr: string) => {
  const template = Handlebars.compile(templateStr)
  return (data: {}) => template(data)
}
