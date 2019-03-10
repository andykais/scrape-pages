import * as os from 'os'
import * as path from 'path'

import { expect } from 'chai'

import { nockMockFolder } from '../../setup'
import { config } from './config'
// import { copy } from '../../../src/util/object'
import * as querySnapshot from './resources/expected-query-result.json'
import { scrape } from '../../../src'
// import * as _ from 'lodash'

// fixes webpack json import error https://github.com/webpack/webpack/issues/8504
const expectedQueryResult = Array.from((querySnapshot as any).default as typeof querySnapshot)

const resourceFolder = `${__dirname}/resources/mock-endpoints`
const resourceUrl = `http://${path.basename(__dirname)}.com`

const options = {}
const params = {
  folder: path.resolve(os.tmpdir(), `scrape-pages--${path.basename(__dirname)}`),
  cleanFolder: true
}
describe('increment gallery site', () => {
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
        .to.deep.equal(expectedQueryResult)
    })
    it('on second pass, it should make zero requests', async () => {
      // const count = { queued: { gallery: 0, image: 0 }, complete: { gallery: 0, image: 0 } }
      // await nockMockFolder(resourceFolder, resourceUrl)
      // const { start, query } = scrape(
      //   config,
      //   // { ...options, cache: true },
      //   _.merge(copy(options), { cache: true, optionsEach: { gallery: { cache: false } } }),
      //   { ...params, cleanFolder: false }
      // )
      // const { on } = await start()
      // on('image:queued', () => count.queued.image++)
      // on('image:complete', () => count.complete.image++)
      // on('gallery:queued', () => count.queued.gallery++)
      // on('gallery:complete', () => count.complete.gallery++)
      // await new Promise(resolve => on('done', resolve))
      // const result = query({ scrapers: ['image'], groupBy: 'image' })
      // console.log(result.map(r => r.map(r => r.downloadData)))
      // expect(count.queued.gallery).to.equal(3)
      // expect(count.queued.image).to.equal(0)
      // expect(count.complete.gallery).to.equal(2)
      // expect(count.complete.image).to.equal(4)
      // const result = query({
      //   scrapers: ['image', 'tag'],
      //   groupBy: 'image-page'
      // })
      // expect(result)
      //   .excludingEvery(['filename', 'id'])
      //   .to.deep.equal(expectedQueryResult)
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
      const expected = expectedQueryResult.map(g => g.filter(r => r.scraper === 'image'))
      expect(result)
        .excludingEvery(['filename', 'id'])
        .to.deep.equal([expected[0], expected[2]])
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
        .to.deep.equal(expectedQueryResult)
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
