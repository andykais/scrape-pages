import * as os from 'os'
import * as path from 'path'

import { expect } from 'chai'

import { nockMockFolder } from '../../setup'
import { config } from './config'
import * as querySnapshot from './resources/expected-query-result.json'
import { scrape } from '../../../src'

// fixes webpack json import error https://github.com/webpack/webpack/issues/8504
const expectedQueryResult = Array.from((querySnapshot as any).default as typeof querySnapshot)

const resourceFolder = `${__dirname}/resources/mock-endpoints`
const resourceUrl = `http://${path.basename(__dirname)}.com`

const options = {}
// in this case, it is ok to reuse params since mocha runs async tests sequentially
const params = {
  folder: path.resolve(os.tmpdir(), `scrape-pages--${path.basename(__dirname)}`),
  cleanFolder: true
}
describe('scrape next site', () => {
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
        .to.deep.equal(expectedQueryResult.map(g => g.filter(r => r.scraper === 'image')))
    })
    it('should group tags and images together that were found on the same page', () => {
      const result = query({
        scrapers: ['image', 'tag'],
        groupBy: 'image-page'
      })
      expect(result)
        .excludingEvery(['filename', 'id'])
        .to.deep.equal(expectedQueryResult)
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
        .to.deep.equal(expectedQueryResult)
    })
  })
})

/**
 * I need a way to say, use the cached response from certain scrapers if hit, and always download again for
 * others
 * - useCachedResponse? default to true?
 */
