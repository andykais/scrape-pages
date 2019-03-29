import * as os from 'os'
import * as path from 'path'

import { expect } from 'chai'

import { nockMockFolder, configureSnapshots } from '../../setup'
import { config } from './config'
import { scrape } from '../../../src'

const resourceFolder = `${__dirname}/resources/mock-endpoints`
const resourceUrl = `http://${path.basename(__dirname)}.com`

const options = {}
// in this case, it is ok to reuse params since mocha runs async tests sequentially
const params = {
  folder: path.resolve(os.tmpdir(), `scrape-pages--${path.basename(__dirname)}`),
  cleanFolder: true
}
describe('scrape next site', () => {
  beforeEach(function() {
    configureSnapshots({ __dirname, __filename, fullTitle: this.currentTest.fullTitle() })
  })

  describe('with instant scraper', () => {
    const { start, query } = scrape(config, options, params)

    before(async () => {
      await nockMockFolder(resourceFolder, resourceUrl)

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
        .to.matchSnapshot()
    })
    it('should group tags and images together that were found on the same page', () => {
      const result = query({
        scrapers: ['image', 'tag'],
        groupBy: 'image-page'
      })
      expect(result)
        .excludingEvery(['filename', 'id'])
        .to.matchSnapshot()
    })
  })

  describe('with psuedo-random delayed scraper', () => {
    const { start, query } = scrape(config, options, params)

    before(async () => {
      await nockMockFolder(resourceFolder, resourceUrl, {
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
        .to.matchSnapshot()
    })
  })
})

/**
 * I need a way to say, use the cached response from certain scrapers if hit, and always download again for
 * others
 * - useCachedResponse? default to true?
 */
