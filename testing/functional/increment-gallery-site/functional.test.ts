import * as os from 'os'
import * as path from 'path'
import { rmrf } from '../../../src/util/fs'
import { UninitializedDatabaseError } from '../../../src/util/errors'

import { expect } from 'chai'

import {
  NockFolderMock,
  configureSnapshots,
  stripResult,
  useRequestStatsRecorder
} from '../../setup'
import { config } from './config'
import { scrape } from '../../../src'

const resourceFolder = `${__dirname}/fixtures`
const resourceUrl = `http://${path.basename(__dirname)}.com`

const options = {}
const params = {
  folder: path.resolve(os.tmpdir(), `scrape-pages--${path.basename(__dirname)}`),
  cleanFolder: true
}
describe(__filename, () => {
  before(async () => await rmrf(params.folder))
  beforeEach(function() {
    configureSnapshots({ __dirname, __filename, fullTitle: this.currentTest!.fullTitle() })
  })

  describe('with instant scraper', () => {
    const { start, query } = scrape(config, options, params)

    before(async () => {
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)

      const { on } = await start()
      await new Promise(resolve => on('done', resolve))
      siteMock.done()
    })

    it('should group each image into a separate slot, in order', () => {
      const result = query({ scrapers: ['image'], groupBy: 'image' })
      expect(stripResult(result)).to.matchSnapshot()
    })
    it('should group tags and images together that were found on the same page', () => {
      const result = query({ scrapers: ['image', 'tag'], groupBy: 'image-page' })
      expect(stripResult(result)).to.matchSnapshot()
    })
  })
  describe('with cached scraper', () => {
    it('should make the expected requests on first pass', async () => {
      const count = { queued: { gallery: 0, image: 0 }, complete: { gallery: 0, image: 0 } }
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)

      const { start, query } = scrape(config, options, params)
      const { on } = await start()
      const { counts } = useRequestStatsRecorder(config, on)
      on('image:queued', () => count.queued.image++)
      on('image:complete', () => count.complete.image++)
      on('gallery:queued', () => count.queued.gallery++)
      on('gallery:complete', () => count.complete.gallery++)
      await new Promise(resolve => on('done', resolve))
      siteMock.done()
      expect(counts.gallery.queued).to.equal(3)
      expect(counts.gallery.complete).to.equal(2)
      expect(counts.image.queued).to.equal(4)
      expect(counts.image.complete).to.equal(4)

      const result = query({ scrapers: ['image', 'tag'], groupBy: 'image-page' })
      expect(stripResult(result)).to.matchSnapshot()
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
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)

      const { on } = await start()
      await new Promise(resolve => on('done', resolve))
      siteMock.done()
    })

    it('should group each image into a separate slot, in order', () => {
      const result = query({ scrapers: ['image'], groupBy: 'image' })
      expect(stripResult(result)).to.matchSnapshot()
    })
  })

  describe('with psuedo-random delayed scraper', () => {
    const { start, query } = scrape(config, options, params)

    before(async () => {
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl, { randomSeed: 1 })

      const { on } = await start()
      await new Promise(resolve => on('done', resolve))
      siteMock.done()
    })

    it('should keep images and tags together, in order', () => {
      const result = query({ scrapers: ['image', 'tag'], groupBy: 'image-page' })
      expect(stripResult(result)).to.matchSnapshot()
    })
  })

  describe('running query() before starting the scraper', () => {
    const { start, query } = scrape(config, options, params)
    // ensure that the database & scraper folder is destroyed
    before(async () => await rmrf(params.folder))
    it('should throw an uninitialized error', () => {
      expect(() => query({ scrapers: ['image'] })).to.throw(UninitializedDatabaseError)
    })
  })
})
