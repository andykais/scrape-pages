import * as path from 'path'

import { expect } from 'chai'
import nock from 'nock'
import {
  RUN_OUTPUT_FOLDER,
  NockFolderMock,
  stripResult,
  useRequestStatsRecorder
} from '../../setup'
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
  describe('cache control', () => {
    step('first pass should fetch all downloads since nothing is in cache', async () => {
      const { start, query } = scrape(config, { cache: true }, params)
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)
      const { on } = await start()
      const { counts } = useRequestStatsRecorder(config, on)
      await new Promise(resolve => on('done', resolve))
      siteMock.done()
      expect(counts.index.queued).to.equal(1)
      expect(counts.index.complete).to.equal(1)
      expect(counts.postTitle.queued).to.equal(5)
      expect(counts.postTitle.complete).to.equal(5)
      const result = query({ scrapers: ['postTitle'] })
      expect(stripResult(result)).to.matchSnapshot()
    })

    step('with all scrapers cache: true, no requests should happen', async () => {
      const { start, query } = scrape(config, { cache: true }, { ...params, cleanFolder: false })
      const resultPre = query({ scrapers: ['postTitle'] })
      expect(stripResult(resultPre)).to.matchSnapshot()
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)
      const { on } = await start()
      const { counts } = useRequestStatsRecorder(config, on)
      await new Promise(resolve => on('done', resolve))
      siteMock.done()
      expect(counts.index.queued).to.equal(0)
      expect(counts.index.complete).to.equal(1)
      expect(counts.postTitle.queued).to.equal(0)
      expect(counts.postTitle.complete).to.equal(5)
      const result = query({ scrapers: ['postTitle'] })
      expect(stripResult(result)).to.deep.equal(stripResult(resultPre))
    })

    step('should make requests for scrapers with cache turned off', async () => {
      const { start, query } = scrape(
        config,
        { logLevel: 'info', cache: true, optionsEach: { index: { cache: false } } },
        { ...params, cleanFolder: false }
      )
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)
      const { on } = await start()
      const { counts } = useRequestStatsRecorder(config, on)
      await new Promise(resolve => on('done', resolve))
      siteMock.done()
      expect(counts.index.queued).to.equal(1)
      expect(counts.index.complete).to.equal(1)
      expect(counts.postTitle.queued).to.equal(0)
      expect(counts.postTitle.complete).to.equal(5)
      const result = query({ scrapers: ['postTitle'] })
      expect(stripResult(result)).to.matchSnapshot()
    })
  })

  describe('emit stop event', () => {
    // nock sends an instant reply, this is not realistic and harder to test, so a delay is added
    const siteMock = new NockFolderMock(resourceFolder, resourceUrl, { delay: 200 })

    beforeEach(siteMock.init)
    afterEach(siteMock.done)

    describe(`emit('stop')`, () => {
      it(`should stop the whole scraper if triggered before any 'complete' event`, async () => {
        const { start, query } = scrape(config, options, params)
        const { on, emit } = await start()
        on('index:queued', () => emit('stop'))
        await new Promise(resolve => on('done', resolve))

        const resultIndex = query({ scrapers: ['index'] })
        expect(resultIndex[0][0].complete).to.equal(0)
        const result = query({ scrapers: ['postTitle'], groupBy: 'postTitle' })
        expect(result.length).to.equal(0)
      })
    })
    describe(`emit('stop:<scraper>')`, () => {
      it('should only stop the postTitle scraper', async () => {
        const { start, query } = scrape(config, options, params)
        const { on, emit } = await start()
        const { counts } = useRequestStatsRecorder(config, on)
        on('index:queued', () => emit('stop:postTitle'))
        await new Promise(resolve => on('done', resolve))

        expect(counts.index.queued).to.equal(1)
        expect(counts.postTitle.queued).to.equal(0)
        const indexResult = query({ scrapers: ['index'], groupBy: 'index' })
        expect(indexResult.length).to.equal(5)
        const result = query({ scrapers: ['postTitle'], groupBy: 'postTitle' })
        expect(result.length).to.equal(0)
      })
    })
  })

  describe('failing requests', () => {
    it('should report the failure and stop the scraper', async () => {
      const config = {
        scrapers: { 'will-fail': { download: 'https://non-existent.com/a/b/c' } },
        run: { scraper: 'will-fail' }
      }
      nock('https://non-existent.com')
        .get('/a/b/c')
        .reply(500)

      const { start } = scrape(config, options, params)
      const { on } = await start()
      const { counts } = useRequestStatsRecorder(config, on)
      await new Promise((resolve, reject) => {
        on('error', (e: Error) => {
          expect(e).to.be.instanceof(Error)
          expect(e.name).to.equal('ResponseError')
          expect(e.message).to.include(
            `scraper 'will-fail': Request "https://non-existent.com/a/b/c" failed.`
          )
          expect(counts['will-fail'].queued).to.equal(1)
          expect(counts['will-fail'].complete).to.equal(0)
          resolve()
        })
        on('done', () => reject(`scraper should have emitted 'error' not 'done'`))
      })
    })
  })

  describe('in progress requests', () => {
    it('it should show complete = 0 in result', async () => {
      const config = {
        scrapers: { slow: { download: 'https://slow-url.com/a' } },
        run: { scraper: 'slow' }
      }
      nock('https://slow-url.com')
        .get('/a')
        .delayBody(1000)
        .reply(200)
      const { start, query } = scrape(config, options, params)
      const { on } = await start()
      const getSlowScraper = query.prepare({ scrapers: ['slow'] })

      on('slow:queued', () => {
        const result = getSlowScraper()
        expect(result.length).to.equal(1)
        expect(result[0].length).to.equal(1)
        expect(result[0][0].complete).to.equal(0) // this is a BIT (1 | 0) column in sqlite
      })

      await new Promise(resolve => on('done', resolve))
      const result = getSlowScraper()
      expect(result.length).to.equal(1)
      expect(result[0].length).to.equal(1)
      expect(result[0][0].complete).to.equal(1)
    })
  })
})
