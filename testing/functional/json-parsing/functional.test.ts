import * as os from 'os'
import * as path from 'path'

import { expect } from 'chai'

import { NockFolderMock, configureSnapshots, stripResult } from '../../setup'
import { config, configParseJsonTwice, configParseJsonInsideScript } from './config'
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
      expect(result.map(r => r.map(c => c.parsedValue))).to.be.deep.equal([
        ['the', 'quick', 'brown', 'fox']
      ])
      expect(stripResult(result)).to.matchSnapshot()
    })
  })

  describe('with json blob parsed nested', () => {
    const { start, query } = scrape(configParseJsonTwice, options, params)
    before(async () => {
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)
      const { on } = await start()
      await new Promise(resolve => on('done', resolve))
      siteMock.done()
    })
    it('should stringify, then parse, then stringify', () => {
      const result = query({ scrapers: ['parseContentFromPost'], groupBy: 'parseContentFromPost' })
      expect(result).to.have.length(4)
      expect(result.map(r => r.map(c => c.parsedValue))).to.be.deep.equal([
        ['the'],
        ['quick'],
        ['brown'],
        ['fox']
      ])
      expect(stripResult(result)).to.matchSnapshot()
    })
  })

  describe('with json that needs to be parsed out of a file', () => {
    const { start, query } = scrape(configParseJsonInsideScript, options, params)
    before(async () => {
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)
      const { on } = await start()
      await new Promise(resolve => on('done', resolve))
      siteMock.done()
    })
    it('should stringify, then parse, then stringify', () => {
      const result = query({ scrapers: ['jsonInJs'] })
      expect(result[0]).to.have.length(9)
      expect(result.map(r => r.map(c => c.parsedValue))).to.be.deep.equal([
        ['the', 'quick', 'brown', 'fox', 'jumped', 'over', 'the', 'lazy', 'dog']
      ])
    })
  })
})
