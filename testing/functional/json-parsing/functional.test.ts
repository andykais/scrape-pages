import * as os from 'os'
import * as path from 'path'

import { expect } from 'chai'

import { NockFolderMock, configureSnapshots, stripResult } from '../../setup'
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
  beforeEach(function() {
    configureSnapshots({ __dirname, __filename, fullTitle: this.currentTest!.fullTitle() })
  })

  describe('with simple json response', () => {
    const { start, query } = scrape(config, options, params)
    before(async () => {
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)

      const { on } = await start()
      await new Promise(resolve => on('done', resolve))
      siteMock.done()
    })
    it('should get em', () => {
      const result = query({ scrapers: ['apiResponse'] })
      expect(stripResult(result)).to.matchSnapshot()
    })
  })
})
