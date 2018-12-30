import os from 'os'
import path from 'path'

import { expect, use } from 'chai'
import chaiExclude from 'chai-exclude'
use(chaiExclude)
import _ from 'lodash/fp'

import { NockFolderMock } from '../../nock-folder-mock'
import PageScraper from '../../../src'
import { config } from './config'
import expectedQueryResult from './resources/expected-query-result.json'

describe('scrape next site', () => {
  describe('with instant scraper', function() {
    let scraperQueryForFunction: any
    before(done => {
      ;(async () => {
        const endpointMock = new NockFolderMock(
          `${__dirname}/resources/mock-endpoints`,
          'http://scrape-next-site.com'
        )
        await endpointMock.init()

        const downloadDir = path.resolve(os.tmpdir(), this.fullTitle())
        const siteScraper = new PageScraper(config)
        siteScraper
          .run({
            folder: downloadDir,
            cleanFolder: true
          })
          .on('done', queryFor => {
            scraperQueryForFunction = queryFor
            done()
          })
      })()
    })

    it('should group each image into a separate slot, in order', () => {
      const result = scraperQueryForFunction({
        scrapers: ['image'],
        groupBy: 'image'
      })
      expect(result)
        .excludingEvery('filename')
        .to.be.deep.equal(expectedQueryResult.map(_.omit('tag')))
    })
    it('should group tags and images together that were found on the same page', () => {
      const result = scraperQueryForFunction({
        scrapers: ['image', 'tag'],
        groupBy: 'image-page'
      })
      expect(result)
        .excludingEvery('filename')
        .to.be.deep.equal(expectedQueryResult)
    })
  })

  describe('with psuedo-random delayed scraper', function() {
    let scraperQueryForFunction: any
    before(done => {
      ;(async () => {
        const endpointMock = new NockFolderMock(
          `${__dirname}/resources/mock-endpoints`,
          'http://scrape-next-site.com',
          { randomSeed: 2 }
        )
        await endpointMock.init()

        const downloadDir = path.resolve(os.tmpdir(), this.fullTitle())
        const siteScraper = new PageScraper(config)
        siteScraper
          .run({
            folder: downloadDir,
            cleanFolder: true,
            maxConcurrent: 10
          })
          .on('done', queryFor => {
            scraperQueryForFunction = queryFor
            done()
          })
      })()
    })

    it('should keep images and tags together, in order', () => {
      const result = scraperQueryForFunction({
        scrapers: ['image', 'tag'],
        groupBy: 'image-page'
      })
      expect(result)
        .excludingEvery('filename')
        .to.be.deep.equal(expectedQueryResult)
    })
  })
})

/**
 * I need a way to say, use the cached response from certain scrapers if hit, and always download again for
 * others
 * - useCachedResponse? default to true?
 */
