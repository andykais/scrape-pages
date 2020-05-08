import { expect } from 'chai'
import { FunctionalTestSetup, assertQueryResultPartial } from '@test/functional/setup'
import { queryExecutionDebugger } from '@test/query-debugger'

import { ScraperProgram } from '@scrape-pages'
import * as instructions from './instructions'

const testEnv = new FunctionalTestSetup(__dirname)

describe(__filename, () => {
  beforeEach(testEnv.beforeEach)
  afterEach(testEnv.afterEach)

  it('can run an empty scraper', async () => {
    const scraper = new ScraperProgram('()', testEnv.outputFolder)
    scraper.start()
    await scraper.toPromise()
  })

  it('can run a scraper twice', async () => {
    testEnv.siteMock.persist()

    const scraper = new ScraperProgram(instructions.simple, testEnv.outputFolder)
    await scraper.start().toPromise()

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

    await scraper.start().toPromise()
    const result2 = scraper.query(['postTitle'])
    expect(result1).to.deep.equal(result2)
  })

  it('can start a scraper after it has been stopped', async () => {
    testEnv.siteMock.persist()

    const scraper = new ScraperProgram(instructions.simple, testEnv.outputFolder)
    scraper.start()
    scraper.stop()
    await scraper.toPromise()

    const resultAfterImmediateStop = scraper.query(['postTitle'])
    expect(resultAfterImmediateStop).to.deep.equal([])

    await scraper.start().toPromise()

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

  it('should restrict inapproriate times to call stop() and start()', async () => {
    const scraper = new ScraperProgram(instructions.simple, testEnv.outputFolder)
    // cannot stop a scaper before it has started
    expect(scraper.stop).to.throw()

    scraper.start()
    // cannot start a scraper that is already active
    expect(scraper.start).to.throw()

    scraper.stop()
    // cannot call stop twice (this is important to test because stopping isnt always synchronous)
    expect(scraper.stop).to.throw()

    await scraper.toPromise()

    // and cannot stop a scraper that has already completed
    expect(scraper.stop).to.throw()
  })

  it.only('should stop values coming to a command after stopCommand is called', async () => {
    const scraper = new ScraperProgram(instructions.merging, testEnv.outputFolder)
    scraper.on('FETCH:queued', ({ LABEL }) => {
      if (LABEL === 'index') scraper.stopCommand('postTitle')
    })

    await scraper.start().toPromise()

    const result = scraper.query(['postTitle', 'urls'])
    assertQueryResultPartial(result, [
      {
        postTitle: [],
        urls: [
          { value: '/post/1.html' },
          { value: '/post/2.html' },
          { value: '/post/3.html' },
          { value: '/post/4.html' },
          { value: '/post/5.html' }
        ]
      }
    ])
  })

  it('can handle two scrapers pointed at the same folder _if_ they are not running simultaneously', async () => {
    testEnv.siteMock.persist()

    const scraper1 = new ScraperProgram(instructions.simple, testEnv.outputFolder)
    const scraper2 = new ScraperProgram(instructions.simple, testEnv.outputFolder)

    scraper1.start()

    // cannot start a when another is active in that folder
    expect(scraper2.start).to.throw()

    const expectedResult = [
      {
        postTitle: [
          { value: 'The' },
          { value: 'Quick' },
          { value: 'Brown' },
          { value: 'Fox' },
          { value: 'Jumped' }
        ]
      }
    ]

    await scraper1.toPromise()
    const result1 = scraper1.query(['postTitle'])
    assertQueryResultPartial(result1, expectedResult)

    // scrapers can query a folder without actually running a scraper
    const result2 = scraper2.query(['postTitle'])
    assertQueryResultPartial(result2, expectedResult)

    // querying again should produce the same output
    await scraper2.start().toPromise()
    const result3 = scraper2.query(['postTitle'])
    assertQueryResultPartial(result3, expectedResult)
  })
})
