import { normalize as normalizeInstructions } from '../normalize/instructions'
import { normalize as normalizeOptions } from '../normalize/options'
import { syntaxCoverageInstruction } from 'scrape-pages/dsl-parser/__tests__/fixtures/expected-parse-results'

describe(__filename, () => {
  describe('instructions normalize function', () => {
    it('should match the expected outcome', () => {
      const result = normalizeInstructions(syntaxCoverageInstruction)
      // check result
    })
  })
})
