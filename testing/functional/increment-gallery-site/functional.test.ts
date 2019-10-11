import * as path from 'path'
import { rmrf } from '../../../src/util/fs'
import { UninitializedDatabaseError } from '../../../src/util/errors'

import { expect } from 'chai'

import { RUN_OUTPUT_FOLDER, NockFolderMock } from '../../setup'
import { config, configWithLimit, configMerging } from './config'
import { expected } from './expected-query-results'
import { scrape } from '../../../src'

const resourceFolder = `${__dirname}/fixtures`
const resourceUrl = `http://${path.basename(__dirname)}.com`

const options = {}
const params = {
  folder: path.resolve(RUN_OUTPUT_FOLDER, `${path.basename(__dirname)}`),
  cleanFolder: true
}
describe(__filename, () => {
  before(async () => {
    // ensure the scrape folder doesnt exist from a previous test run
    await rmrf(params.folder)
  })

  const testables = [
    {
      name: 'normal',
      scraper: scrape(config, options, params),
      siteMock: new NockFolderMock(resourceFolder, resourceUrl)
    },
    {
      name: 'psuedo delayed',
      scraper: scrape(config, options, params),
      siteMock: new NockFolderMock(resourceFolder, resourceUrl, { randomSeed: 2 })
    },
    {
      name: 'flattened config',
      scraper: scrape(configMerging, options, params),
      siteMock: new NockFolderMock(resourceFolder, resourceUrl)
    }
  ]

  testables.forEach(({ name, scraper, siteMock }) => {
    describe(`with ${name} scraper`, () => {
      const { start, query } = scraper

      before(async () => {
        await siteMock.init()
        const { on } = await start()
        await new Promise(resolve => on('done', resolve))
        siteMock.done()
      })

      it('should group each image into a separate slot, in order', () => {
        const queryArgs = { scrapers: ['image'], groupBy: 'image' }
        const result = query(queryArgs)
        expect(result).to.equalQueryResult(expected[JSON.stringify(queryArgs)])
      })
      it('should group tags and images together that were found on the same page', function() {
        const queryArgs = { scrapers: ['image', 'tag'], groupBy: 'image-page' }
        const result = query(queryArgs)
        expect(result).to.equalQueryResult(expected[JSON.stringify(queryArgs)])
      })
    })
  })

  it('calling query() before start() should throw an uninitialized error', async () => {
    const { query } = scrape(config, options, params)
    expect(() => query({ scrapers: ['image'] })).to.throw(UninitializedDatabaseError)
  })

  describe('with value limit', () => {
    const { start, query } = scrape(configWithLimit, options, params)

    before(async () => {
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)
      const { on } = await start()
      await new Promise(resolve => on('done', resolve))
      siteMock.done()
    })

    it('should group each image into a separate slot, in order', () => {
      const queryArgs = { scrapers: ['image'], groupBy: 'image' }
      const result = query(queryArgs)

      expect(result).to.have.length(2)
      // the first value is parsed from each gallery page
      const [expected1, _, expected3] = expected[JSON.stringify(queryArgs)]
      expect(result).to.equalQueryResult([expected1, expected3])
    })
    it('should group tags and images together that were found on the same page', () => {
      const queryArgs = { scrapers: ['image', 'tag'], groupBy: 'image-page' }
      const result = query(queryArgs)

      expect(result).to.have.length(2)
      const [expected1, _, expected3] = expected[JSON.stringify(queryArgs)]
      expect(result).to.equalQueryResult([expected1, expected3])
    })
  })
})
