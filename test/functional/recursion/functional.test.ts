import { expect } from 'chai'
import { FunctionalTestSetup, assertQueryResultPartial } from '@test/functional/setup'
import { ScraperProgram } from '@scrape-pages'
import * as instructions from './instructions'

const testEnv = new FunctionalTestSetup(__dirname)

describe(__filename, () => {
  beforeEach(testEnv.beforeEach)
  afterEach(testEnv.afterEach)

  it('should handle simple instruction', async () => {
    const scraper = new ScraperProgram(instructions.simple, testEnv.outputFolder)
    await scraper.start()
    await scraper.toPromise()

    const result = scraper.query(['image'])
    // prettier-ignore
    assertQueryResultPartial(result, [
      {
        image: [
          { requestParams: '{"url":"http://recursion/image/brown.jpg","headers":{},"method":"GET"}' },
          { requestParams: '{"url":"http://recursion/image/fox.jpg","headers":{},"method":"GET"}' },
          { requestParams: '{"url":"http://recursion/image/jumped.jpg","headers":{},"method":"GET"}' },
          { requestParams: '{"url":"http://recursion/image/over.jpg","headers":{},"method":"GET"}' }
        ]
      }
    ])
  })
  it('should handle merging instruction', async () => {
    const scraper = new ScraperProgram(instructions.merging, testEnv.outputFolder)
    await scraper.start()
    await scraper.toPromise()

    const result = scraper.query(['image'])

    // prettier-ignore
    assertQueryResultPartial(result, [
      {
        image: [
          { requestParams: '{"url":"http://recursion/image/the.jpg","headers":{},"method":"GET"}' },
          { requestParams: '{"url":"http://recursion/image/quick.jpg","headers":{},"method":"GET"}' },
          { requestParams: '{"url":"http://recursion/image/brown.jpg","headers":{},"method":"GET"}' },
          { requestParams: '{"url":"http://recursion/image/fox.jpg","headers":{},"method":"GET"}' },
          { requestParams: '{"url":"http://recursion/image/jumped.jpg","headers":{},"method":"GET"}' },
          { requestParams: '{"url":"http://recursion/image/over.jpg","headers":{},"method":"GET"}' }
        ]
      }
    ])
  })
})
