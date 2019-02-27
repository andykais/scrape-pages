import os from 'os'
import path from 'path'

import { expect } from 'chai'

import { nockMockFolder } from '../../setup'
import { config } from './config'
import expectedQueryResult from './resources/expected-query-result.json'
import { scrape } from '../../../src'

const options = {
  optionsEach: {
    image: {
      read: false,
      write: true
    }
  }
}
// in this case, it is ok to reuse params since mocha runs async tests sequentially
const params = {
  folder: path.resolve(os.tmpdir(), 'scrape-pages--scrape-next-site'),
  cleanFolder: true
}
describe('scrape next site', () => {
  describe('with instant scraper', function() {
    const { start, query } = scrape(config, options, params)

    before(async () => {
      await nockMockFolder(`${__dirname}/resources/mock-endpoints`, 'http://scrape-next-site.com')

      const { on } = await start()
      await new Promise(resolve => on('done', resolve))
    })

    it('should group each image into a separate slot, in order', () => {
      const result = query({
        scrapers: ['image'],
        groupBy: 'image'
      })
      expect(result)
        .excludingEvery(['filename', 'id'])
        .to.be.deep.equal(expectedQueryResult.map(g => g.filter(r => r.scraper === 'image')))
    })
    it('should group tags and images together that were found on the same page', () => {
      const result = query({
        scrapers: ['image', 'tag'],
        groupBy: 'image-page'
      })
      expect(result)
        .excludingEvery(['filename', 'id'])
        .to.be.deep.equal(expectedQueryResult)
    })
  })

  describe('with psuedo-random delayed scraper', function() {
    const { start, query } = scrape(config, options, params)

    before(async () => {
      await nockMockFolder(`${__dirname}/resources/mock-endpoints`, 'http://scrape-next-site.com', {
        randomSeed: 2
      })

      const { on } = await start()
      await new Promise(resolve => on('done', resolve))
    })

    it('should keep images and tags together, in order', () => {
      const result = query({
        scrapers: ['image', 'tag'],
        groupBy: 'image-page'
      })
      expect(result)
        .excludingEvery(['filename', 'id'])
        .to.be.deep.equal(expectedQueryResult)
    })
  })
})

/**
 * I need a way to say, use the cached response from certain scrapers if hit, and always download again for
 * others
 * - useCachedResponse? default to true?
 */
