import { FunctionalTestSetup, assertQueryResultPartial } from '@test/functional/setup'

import { ScraperProgram } from '@scrape-pages'
import * as instructions from './instructions'

const testEnv = new FunctionalTestSetup(__dirname)

describe(__filename, () => {
  beforeEach(testEnv.beforeEach)
  afterEach(testEnv.afterEach)

  describe('json', () => {
    describe('with simple instructions', () => {
      it(`should handle FORMAT='json'`, async () => {
        const scraper = new ScraperProgram(instructions.simple, testEnv.outputFolder)
        await scraper.start().toPromise()

        const result = scraper.query(['post'])
        assertQueryResultPartial(result, [
          {
            post: [{ value: 'the' }, { value: 'quick' }, { value: 'brown' }, { value: 'fox' }]
          }
        ])
      })
    })

    describe('with twice parsed json', () => {
      it('should handle json being passed from a parse', async () => {
        const scraper = new ScraperProgram(instructions.parseJsonTwice, testEnv.outputFolder)
        await scraper.start().toPromise()

        const result = scraper.query(['post'])
        assertQueryResultPartial(result, [
          {
            post: [{ value: 'the' }, { value: 'quick' }, { value: 'brown' }, { value: 'fox' }]
          }
        ])
      })
    })

    describe('with json inside another document', () => {
      it('should parse any valid json from a string', async () => {
        const scraper = new ScraperProgram(instructions.jsonInsideScript, testEnv.outputFolder)
        await scraper.start().toPromise()

        const result = scraper.query(['words'])
        assertQueryResultPartial(result, [
          {
            words: [
              { value: 'the' },
              { value: 'quick' },
              { value: 'brown' },
              { value: 'fox' },
              { value: 'jumped' },
              { value: 'over' },
              { value: 'the' },
              { value: 'lazy' },
              { value: 'dog' }
            ]
          }
        ])
      })
    })
  })
})
