import { compileTemplate } from '../handlebars'
import { expect } from 'chai'

describe(__filename, () => {
  it('should work with multiplication operator', () => {
    const template = `{{'*' 2 4}}`
    const compiledString = compileTemplate(template)()
    expect(compiledString).to.equal('8')
  })
  it('should work with addition operator', () => {
    const template = `{{'+' 2 4}}`
    const compiledString = compileTemplate(template)()
    expect(compiledString).to.equal('6')
  })
  it('should work with division operator', () => {
    const template = `{{'/' 2 4}}`
    const compiledString = compileTemplate(template)()
    expect(compiledString).to.equal('0.5')
  })
  it('should work with subtraction operator', () => {
    const template = `{{'-' 2 4}}`
    const compiledString = compileTemplate(template)()
    expect(compiledString).to.equal('-2')
  })
  it('should do nothing with an extra parameter', () => {
    const template = `{{'*' 2 4 5}}`
    const compiledString = compileTemplate(template)()
    expect(compiledString).to.equal('8')
  })
  it('should fail without quotes around operator', () => {
    const template = `{{* 2 4 5}}`
    const compiledTemplate = compileTemplate(template)
    expect(compiledTemplate).to.throw()
  })
})
