import { expect } from 'chai'
import { FunctionalTestSetup, assertQueryResultPartial } from '@test/functional/setup'
import { queryExecutionDebugger } from '@test/query-debugger'

import { ScraperProgram } from '@scrape-pages'
import * as instructions from './instructions'

const testEnv = new FunctionalTestSetup(__dirname)

describe.only(__filename, () => {
  beforeEach(testEnv.beforeEach)
  afterEach(testEnv.afterEach)

  it('can run a scraper twice', async () => {
    testEnv.siteMock.persist()

    const scraper = new ScraperProgram(instructions.simple, testEnv.outputFolder)
    await scraper.start()
    await scraper.toPromise()

    const result1 = scraper.query(['postTitle'])
    assertQueryResultPartial(result1, [
      {
        postTitle: [
          { value: 'The' },
          { value: 'Quick' },
          { value: 'Brown' },
          { value: 'Fox' },
          { value: 'Jumped' }
        ]
      }
    ])

    await scraper.start()
    await scraper.toPromise()
    const result2 = scraper.query(['postTitle'])
    expect(result1).to.deep.equal(result2)
  })

  it('can start a scraper after it has been stopped', async () => {
    testEnv.siteMock.persist()

    const scraper = new ScraperProgram(instructions.simple, testEnv.outputFolder)
    await scraper.start()
    scraper.stop()
    await scraper.toPromise()

    const resultAfterImmediateStop = scraper.query(['postTitle'])
    expect(resultAfterImmediateStop).to.deep.equal([])

    await scraper.start()
    await scraper.toPromise()

    const result = scraper.query(['postTitle'])
    assertQueryResultPartial(result, [
      {
        postTitle: [
          { value: 'The' },
          { value: 'Quick' },
          { value: 'Brown' },
          { value: 'Fox' },
          { value: 'Jumped' }
        ]
      }
    ])
  })
})
