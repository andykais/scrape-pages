import * as path from 'path'
import { rmrf } from '../../../src/util/fs'
import { UninitializedDatabaseError } from '../../../src/util/errors'

import { expect } from 'chai'

import { RUN_OUTPUT_FOLDER, NockFolderMock } from '../../setup'
import { config, configWithLimit, configMerging } from './config'
import { expected } from './expected-query-results'
import { ScraperProgram } from '../../../src'
// type imports
import { QueryArgs } from '../../../src/tools/store/querier-entrypoint'

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
      scraper: new ScraperProgram(config, options, params),
      siteMock: new NockFolderMock(resourceFolder, resourceUrl)
    },
    {
      name: 'psuedo delayed',
      scraper: new ScraperProgram(config, options, params),
      siteMock: new NockFolderMock(resourceFolder, resourceUrl, { randomSeed: 2 })
    },
    {
      name: 'flattened config',
      scraper: new ScraperProgram(configMerging, options, params),
      siteMock: new NockFolderMock(resourceFolder, resourceUrl)
    }
  ]

  testables.forEach(({ name, scraper, siteMock }) => {
    describe(`with ${name} scraper`, () => {

      before(async () => {
        await siteMock.init()
        await new Promise(resolve => scraper.on('done', resolve).start())
        siteMock.done()
      })

      it('should group each image into a separate slot, in order', () => {
        const queryArgs: QueryArgs = [['image'], { groupBy: 'image' }]
        const result = scraper.query(...queryArgs)
        expect(result).to.equalQueryResult(expected[JSON.stringify(queryArgs)])
      })
      it('should group tags and images together that were found on the same page', function() {
        const queryArgs: QueryArgs = [['image', 'tag'], { groupBy: 'image-page' }]
        const result = scraper.query(...queryArgs)
        expect(result).to.equalQueryResult(expected[JSON.stringify(queryArgs)])
      })
    })
  })

  it('calling query() before start() should throw an uninitialized error', async () => {
    const scraper = new ScraperProgram(config, options, params)
    expect(() => scraper.query(['image'])).to.throw(UninitializedDatabaseError)
  })

  describe('with value limit', () => {
    const scraper = new ScraperProgram(configWithLimit, options, params)

    before(async () => {
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)
      await new Promise(resolve => scraper.on('done', resolve).start())
      siteMock.done()
    })

    it('should group each image into a separate slot, in order', () => {
      const queryArgs: QueryArgs = [['image'], { groupBy: 'image' }]
      const result = scraper.query(...queryArgs)

      expect(result).to.have.length(2)
      // the first value is parsed from each gallery page
      const [expected1, _, expected3] = expected[JSON.stringify(queryArgs)]
      expect(result).to.equalQueryResult([expected1, expected3])
    })
    it('should group tags and images together that were found on the same page', () => {
      const queryArgs: QueryArgs = [['image', 'tag'], { groupBy: 'image-page' }]
      const result = scraper.query(...queryArgs)

      expect(result).to.have.length(2)
      const [expected1, _, expected3] = expected[JSON.stringify(queryArgs)]
      expect(result).to.equalQueryResult([expected1, expected3])
    })
  })
})
