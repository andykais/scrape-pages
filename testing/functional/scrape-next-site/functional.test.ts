import * as path from 'path'
import jsonata from 'jsonata'

import { expect } from 'chai'
import chaiJestSnapshot from 'chai-jest-snapshot'

import { RUN_OUTPUT_FOLDER, NockFolderMock } from '../../setup'
import { config, configFlattened } from './config'
import { expected } from './expected-query-results'
import { scrape } from '../../../src'

const resourceFolder = `${__dirname}/fixtures`
const resourceUrl = `http://${path.basename(__dirname)}.com`

const options = {}
// in this case, it is ok to reuse params since mocha runs async tests sequentially
const params = {
  folder: path.resolve(RUN_OUTPUT_FOLDER, `${path.basename(__dirname)}`),
  cleanFolder: true
}
describe(__filename, () => {
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
      scraper: scrape(configFlattened, options, params),
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
      it('should group tags and images together that were found on the same page', () => {
        const queryArgs = { scrapers: ['image', 'tag'], groupBy: 'image-page' }
        const result = query(queryArgs)
        expect(result).to.equalQueryResult(expected[JSON.stringify(queryArgs)])
      })
    })
  })
})
