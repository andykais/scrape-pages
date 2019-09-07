import * as path from 'path'
import { rmrf } from '../../../src/util/fs'
import { UninitializedDatabaseError } from '../../../src/util/errors'

import { expect } from 'chai'

import { RUN_OUTPUT_FOLDER, NockFolderMock, stripResult } from '../../setup'
import { config } from './config'
import { scrape } from '../../../src'

const resourceFolder = `${__dirname}/fixtures`
const resourceUrl = `http://${path.basename(__dirname)}.com`

const options = {}
const params = {
  folder: path.resolve(RUN_OUTPUT_FOLDER, `${path.basename(__dirname)}`),
  cleanFolder: true
}
describe(__filename, () => {
  const { start, query } = scrape(config, options, params)
  it('calling query() before start() should throw an uninitialized error', async () => {
    await rmrf(params.folder)
    expect(() => query({ scrapers: ['image'] })).to.throw(UninitializedDatabaseError)
  })

  describe('testing asynchronousity & ordering', () => {
    step('instant scraper', async () => {
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)
      const { on } = await start()
      await new Promise(resolve => on('done', resolve))
      siteMock.done()
      // should group each image into a separate slot, in order
      const flatResult = query({ scrapers: ['image'], groupBy: 'image' })
      expect(stripResult(flatResult)).to.matchSnapshot()
      // should group tags and images together that were found on the same page
      const groupedResult = query({ scrapers: ['image', 'tag'], groupBy: 'image-page' })
      expect(stripResult(groupedResult)).to.matchSnapshot()
    })

    step('psuedo-random delayed scraper', async () => {
      // preResult matches what instant scraper returned
      const preResult = query({ scrapers: ['image', 'tag'], groupBy: 'image-page' })

      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl, { randomSeed: 1 })
      const { on } = await start()
      await new Promise(resolve => on('done', resolve))
      siteMock.done()

      const result = query({ scrapers: ['image', 'tag'], groupBy: 'image-page' })
      expect(stripResult(result)).to.deep.equal(stripResult(preResult))
    })
  })

  describe('with value limit', () => {
    const siteMock = new NockFolderMock(resourceFolder, resourceUrl)
    beforeEach(async () => await siteMock.init())
    afterEach(() => siteMock.done())

    step('first pass does not use the value limit', async () => {
      const { start, query } = scrape(config, options, params)
      const { on } = await start()
      await new Promise(resolve => on('done', resolve))

      const result = query({ scrapers: ['image'], groupBy: 'image' })
      expect(result).to.have.length(4)
      expect(stripResult(result)).to.matchSnapshot()
    })
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
    step('second pass should find only the images on the first gallery page', async () => {
      const { start, query } = scrape(configWithLimit, options, params)
      const { on } = await start()
      await new Promise(resolve => on('done', resolve))

      const result = query({ scrapers: ['image'], groupBy: 'image' })
      expect(result).to.have.length(2)
      expect(stripResult(result)).to.matchSnapshot()
    })
  })
})
