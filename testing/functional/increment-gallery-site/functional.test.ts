import * as os from 'os'
import * as path from 'path'
import { omit } from 'lodash'

import { expect } from 'chai'

import { nockMockFolder, configureSnapshots } from '../../setup'
import { config } from './config'
import { scrape } from '../../../src'

const resourceFolder = `${__dirname}/resources/mock-endpoints`
const resourceUrl = `http://${path.basename(__dirname)}.com`

const options = {}
const params = {
  folder: path.resolve(os.tmpdir(), `scrape-pages--${path.basename(__dirname)}`),
  cleanFolder: true
}
describe('increment gallery site', () => {
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
  describe('with cached scraper', () => {
    it('should make the expected requests on first pass', async () => {
      const count = { queued: { gallery: 0, image: 0 }, complete: { gallery: 0, image: 0 } }
      await nockMockFolder(resourceFolder, resourceUrl)

      const { start, query } = scrape(config, options, params)
      const { on } = await start()
      on('image:queued', () => count.queued.image++)
      on('image:complete', () => count.complete.image++)
      on('gallery:queued', () => count.queued.gallery++)
      on('gallery:complete', () => count.complete.gallery++)
      await new Promise(resolve => on('done', resolve))
      expect(count.queued.gallery).to.equal(3)
      expect(count.queued.image).to.equal(4)
      expect(count.complete.gallery).to.equal(2)
      expect(count.complete.image).to.equal(4)

      const result = query({
        scrapers: ['image', 'tag'],
        groupBy: 'image-page'
      })
      expect(result)
        .excludingEvery(['filename', 'id'])
        .to.matchSnapshot()
    })
  })

  describe('with value limit', () => {
    const configWithLimit = {
      ...config,
      scrapers: {
        ...config.scrapers,
        gallery: {
          ...config.scrapers.gallery,
          parse: { ...(config.scrapers.gallery.parse as { selector: string }), limit: 1 }
        }
      }
    }
    const { start, query } = scrape(configWithLimit, options, params)

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
  })

  describe('with psuedo-random delayed scraper', () => {
    const { start, query } = scrape(config, options, params)

    before(async () => {
      await nockMockFolder(resourceFolder, resourceUrl, { randomSeed: 1 })

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
 *
 * I need a way to say reuse existing store if found, if not, remove the files
 * - cleanFolder
 */
