import { expect } from 'chai'
// import { dslParser } from '../'
// import { syntaxCoverageInstruction } from './fixtures/expected-parse-results'
// import { typecheckInstructions } from '@scrape-pages/types/runtime-typechecking'

// const instructions = `
// # hi
// INPUT 'hi'
// (
//   FETCH 'https://google.com' METHOD='GET' WRITE=true

//   # another comment

//   FETCH 'https://wikipedia.com' WRITE=true READ=true
//   PARSE 'span > a' ATTR='href' MAX=10 LABEL='test'
// )
// .until('{{value}}' == 'x' || ('{{index}}' <= 2))
// .map(
//   # comment
// ).branch(
// (
//   FETCH 'me' METHOD='PUT'
//   FETCH 'me'
// ).map(
//   FETCH 'you'
// )
// )
// `

// const instructionsWithLeaves = `
// (
//   POST 'https://google.com/login'
// ).leaf(
//   GET 'https://google.com/settings'
// ).leaf(
//   GET 'https://google.com/photos'
// ).map(
// # I'm working with the https://google.com response

// )
// `

// describe(__filename, () => {
//   describe('instruction set covering all syntax', () => {
//     it.only('should match expected output', () => {
//       const parsedInstructions = dslParser(instructions)
//       expect(parsedInstructions).to.be.deep.equal(syntaxCoverageInstruction)
//     })

//     it('should match the Instruction type', () => {
//       const parsedInstructions = dslParser(instructions)
//       expect(() => typecheckInstructions(parsedInstructions)).to.not.throw()
//     })
//   })
// })
describe(__filename, () => {
  it('me', () => {
    console.log('nd shit')
  })
})
