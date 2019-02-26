import os from 'os'
import path from 'path'

import { expect } from 'chai'

import '../../use-chai-plugins'
import { nockMockFolder } from '../../nock-folder-mock'
import { config } from './config'
import expectedQueryResult from './resources/expected-query-result.json'
import { scrape } from '../../../src'
// type imports
import { Store } from '../../../src/tools/store'

describe('scrape next site', () => {
  describe('with instant scraper', function() {
    let scraperQueryFn: Store['query']
    before(done => {
      ;(async () => {
        await nockMockFolder(`${__dirname}/resources/mock-endpoints`, 'http://scrape-next-site.com')

        const options = {
          optionsEach: {
            image: {
              read: false,
              write: true
            }
          }
        }
        const params = {
          folder: path.resolve(os.tmpdir(), this.fullTitle()),
          cleanFolder: true
        }
        const { on, query } = await scrape(config, options, params)
        scraperQueryFn = query
        on('done', done)
      })()
    })

    it('should group each image into a separate slot, in order', () => {
      const result = scraperQueryFn({
        scrapers: ['image'],
        groupBy: 'image'
      })
      expect(result)
        .excludingEvery(['filename', 'id'])
        .to.be.deep.equal(expectedQueryResult.map(g => g.filter(r => r.scraper === 'image')))
    })
    it('should group tags and images together that were found on the same page', () => {
      const result = scraperQueryFn({
        scrapers: ['image', 'tag'],
        groupBy: 'image-page'
      })
      expect(result)
        .excludingEvery(['filename', 'id'])
        .to.be.deep.equal(expectedQueryResult)
    })
  })

  describe('with psuedo-random delayed scraper', function() {
    let scraperQueryForFunction: any
    before(done => {
      ;(async () => {
        await nockMockFolder(
          `${__dirname}/resources/mock-endpoints`,
          'http://scrape-next-site.com',
          { randomSeed: 2 }
        )

        const options = {
          optionsEach: {
            image: {
              read: false,
              write: true
            }
          }
        }
        const params = {
          folder: path.resolve(os.tmpdir(), this.fullTitle()),
          cleanFolder: true
        }
        const { on, query } = await scrape(config, options, params)
        scraperQueryForFunction = query
        on('done', done)
      })()
    })

    it('should keep images and tags together, in order', () => {
      const result = scraperQueryForFunction({
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
