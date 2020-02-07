import * as path from 'path'
import { expect } from 'chai'

import { RUN_OUTPUT_FOLDER, NockFolderMock } from '../../setup'
import { config, configFlattened } from './config'
import { expected } from './expected-query-results'
import { ScraperProgram } from '../../../src'
/// type imports
import { QueryArgs } from '../../../src/tools/store/querier-entrypoint'

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
      scraper: new ScraperProgram(configFlattened, options, params),
      siteMock: new NockFolderMock(resourceFolder, resourceUrl)
    }
  ]

  testables.forEach(({ name, scraper, siteMock }) => {
    describe(`with ${name} scraper`, () => {
      // const { start, query } = scraper

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
      it('should group tags and images together that were found on the same page', () => {
        const queryArgs: QueryArgs = [['image', 'tag'], { groupBy: 'image-page' }]
        const result = scraper.query(...queryArgs)
        expect(result).to.equalQueryResult(expected[JSON.stringify(queryArgs)])
      })
    })
  })
})
