import { expect } from 'chai'
import { dslParser } from '../'
import { syntaxCoverageInstruction } from './fixtures/expected-parse-results'
import { typecheckInstructions } from 'scrape-pages/types/runtime-typechecking'

const instructions = `
INPUT 'hi'
(

  GET 'https://google.com' WRITE=true

  GET 'https://wikipedia.com' WRITE=true READ=true
  PARSE 'span > a' ATTR='href' MAX=10
  TAG 'test'
)
.until('{{value}}' == 'x' || ('{{index}}' <= 2))
.map(
  TAG 'nother'
  # a comment
).branch(
(
  GET 'me'
  GET 'me'
).map(
  GET 'you'
),
(
 TAG 'ne'
)
)
`

describe(__filename, () => {
  describe('instruction set covering all syntax', () => {
    it('should match expected output', () => {
      const parsedInstructions = dslParser(instructions)
      expect(parsedInstructions).to.be.deep.equal(syntaxCoverageInstruction)
    })

    it('should match the Instruction type', () => {
      const parsedInstructions = dslParser(instructions)
      expect(() => typecheckInstructions(parsedInstructions)).to.not.throw()
    })
  })
})
