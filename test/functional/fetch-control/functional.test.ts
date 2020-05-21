import nock from 'nock'
import { expect } from 'chai'
import { FunctionalTestSetup, assertQueryResultPartial } from '@test/functional/setup'

import { ScraperProgram } from '@scrape-pages'
import * as instructions from './instructions'

const testEnv = new FunctionalTestSetup(__dirname)

describe(__filename, () => {
  beforeEach(testEnv.beforeEach)
  afterEach(testEnv.afterEach)

  describe('caching', () => {
    it('should use the cache on the second pass', async () => {
      testEnv.siteMock.persist()

      const options = { FETCH: { defaults: { CACHE: true } } }
      const scraper = new ScraperProgram(instructions.simple, testEnv.outputFolder, options)

      await scraper.start().toPromise()
      expect(testEnv.siteMock.requestStats.allRoutesUsed()).to.equal(true)

      const result1 = scraper.query(['postTitle'])
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
      assertQueryResultPartial(result1, expectedResult)

      await testEnv.siteMock.requestStats.resetCount()

      // second pass should use cache
      await scraper.start().toPromise()
      expect(testEnv.siteMock.requestStats.allRoutesUsed()).to.equal(false)
      expect(testEnv.siteMock.requestStats.totalRoutesUsed()).to.equal(0)
      const result2 = scraper.query(['postTitle'])
      assertQueryResultPartial(result2, expectedResult)

      // we can also specify individual fetch commads to be cached
      const scraperCachePost = new ScraperProgram(instructions.cachePost, testEnv.outputFolder)
      await scraperCachePost.start().toPromise()
      expect(testEnv.siteMock.requestStats.allRoutesUsed()).to.equal(false)
      expect(testEnv.siteMock.requestStats.totalRoutesUsed()).to.equal(1)
      const result3 = scraperCachePost.query(['postTitle'])
      assertQueryResultPartial(result3, expectedResult)

      // running without cache should make normal requests
      const scraperNoCache = new ScraperProgram(instructions.simple, testEnv.outputFolder)
      await scraperNoCache.start().toPromise()
      expect(testEnv.siteMock.requestStats.allRoutesUsed()).to.equal(true)
      const result4 = scraperNoCache.query(['postTitle'])
      assertQueryResultPartial(result4, expectedResult)
    })
  })

  describe('failing requests', () => {
    it('should report the failure and stop the scraper', async () => {
      nock('https://non-existent.com').get('/a/b/c').reply(500)

      const instructions = `
      (
        FETCH 'https://non-existent.com/a/b/c' LABEL='errored'
      )`
      const scraper = new ScraperProgram(instructions, testEnv.outputFolder)
      try {
        await scraper.start().toPromise()
        throw new Error(`scraper should have emitted 'error' not 'done'.`)
      } catch (e) {
        expect(e).to.be.instanceof(Error)
        expect(e.name).to.equal('ResponseError')
      }
      const result = scraper.query(['errored'])
      expect(result).to.deep.equal([])
    })
    // .catch() is going to be difficult for ordering. I dont want to deal with it yet
    it.skip('should be able to skip failed requests', async () => {
      nock('https://non-existent.com').get('/a/b/c').reply(500)

      const instructions = `
      (
        FETCH 'https://non-existent.com' LABEL='errored'
        # alternately:
        FETCH 'https://non-existent.com' LABEL='error' ALLOW_FAILURES=true
      ).catch(
        REPLACE '' LABEL='caught'
      )`
      const scraper = new ScraperProgram(instructions, testEnv.outputFolder)
      const result = scraper.query(['errored'])
      expect(result).to.deep.equal([{ errored: [], caught: [{ value: '' }] }])
    })
    it.skip('should be able to retry failed requests', async () => {})
  })

  describe('request cancellation', () => {
    it('should occur when stop() is called', async () => {
      const instructions = `
      (
        FETCH 'https://fast-request' LABEL='beforeStop'
        FETCH 'https://slow-request' LABEL='afterStop'
      )`
      const scraper = new ScraperProgram(instructions, testEnv.outputFolder)

      nock('https://fast-request').get('/').reply(200)
      nock('https://slow-request')
        .get('/')
        .reply(() => {
          scraper.stop()
          // this never sends a reply, so it should cause mocha to yell at us if the scraper isnt stopped
        })

      await scraper.start().toPromise()

      const result = scraper.query(['beforeStop', 'afterStop'])
      assertQueryResultPartial(result, [
        {
          beforeStop: [{ value: '' }],
          afterStop: []
        }
      ])
    })
  })
})
