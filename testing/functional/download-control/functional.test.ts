import * as path from 'path'

import { expect } from 'chai'
import nock from 'nock'
import { RUN_OUTPUT_FOLDER, NockFolderMock, useRequestStatsRecorder } from '../../setup'
import { config, configBranching } from './config'
import { expected } from './expected-query-results'
import { scrape } from '../../../src'
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
  describe('cache control', () => {
    const queryArgs: QueryArgs = [['postTitle']]
    step('first pass should fetch all downloads since nothing is in cache', async () => {
      const { start, query } = scrape(config, { cache: true }, params)
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)
      const emitter = await start()
      const { counts } = useRequestStatsRecorder(config, emitter)
      await new Promise(resolve => emitter.on('done', resolve))
      siteMock.done()
      expect(counts.index.queued).to.equal(1)
      expect(counts.index.complete).to.equal(1)
      expect(counts.postTitle.queued).to.equal(5)
      expect(counts.postTitle.complete).to.equal(5)
      const result = query(...queryArgs)
      expect(result).to.equalQueryResult(expected[JSON.stringify(queryArgs)])
    })

    step('with all scrapers cache: true, no requests should happen', async () => {
      const { start, query } = scrape(config, { cache: true }, { ...params, cleanFolder: false })
      const resultPre = query(...queryArgs)
      expect(resultPre).to.equalQueryResult(expected[JSON.stringify(queryArgs)])

      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)
      const emitter = await start()
      const { counts } = useRequestStatsRecorder(config, emitter)
      await new Promise(resolve => emitter.on('done', resolve))
      siteMock.done()
      expect(counts.index.queued).to.equal(0)
      expect(counts.index.complete).to.equal(1)
      expect(counts.postTitle.queued).to.equal(0)
      expect(counts.postTitle.complete).to.equal(5)
      const result = query(...queryArgs)
      expect(result).to.equalQueryResult(expected[JSON.stringify(queryArgs)])
    })

    step('should make requests for scrapers with cache turned off', async () => {
      const { start, query } = scrape(
        config,
        { logLevel: 'info', cache: true, optionsEach: { index: { cache: false } } },
        { ...params, cleanFolder: false }
      )
      const siteMock = await NockFolderMock.create(resourceFolder, resourceUrl)
      const emitter = await start()
      const { counts } = useRequestStatsRecorder(config, emitter)
      await new Promise(resolve => emitter.on('done', resolve))
      siteMock.done()
      expect(counts.index.queued).to.equal(1)
      expect(counts.index.complete).to.equal(1)
      expect(counts.postTitle.queued).to.equal(0)
      expect(counts.postTitle.complete).to.equal(5)
      const result = query(...queryArgs)
      expect(result).to.deep.equal(expected[JSON.stringify(queryArgs)])
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
        const { on, emit } = start()
        on('index:queued', () => emit('stop'))
        await new Promise(resolve => on('done', resolve))

        const resultIndex = query(['index'])
        expect(resultIndex[0]['index'][0].complete).to.equal(0)
        const result = query(['postTitle'], { groupBy: 'postTitle' })
        expect(result.length).to.equal(0)
      })
    })
    describe(`emit('stop:<scraper>')`, () => {
      it('should only stop the postTitle scraper', async () => {
        const { start, query } = scrape(configBranching, options, params)
        const emitter = start()
        const { counts } = useRequestStatsRecorder(configBranching, emitter)
        // emitter.emit('stop:postTitle')
        // TODO stop is still fickle on continuous runs...sometimes postTitle queues get through
        emitter.on('index:queued', () => emitter.emit('stop:postTitle'))
        await new Promise(resolve => emitter.on('done', resolve))

        expect(counts.index.queued).to.equal(1)
        expect(counts.postTitle.queued).to.equal(0)
        expect(counts.postTitle_dup.queued).to.equal(5)

        const indexResult = query(['index'], { groupBy: 'index' })
        expect(indexResult.length).to.equal(5)
        const result = query(['postTitle'], { groupBy: 'postTitle' })
        expect(result.length).to.equal(0)
        const branchResult = query(['postTitle_dup'], { groupBy: 'postTitle_dup' })
        expect(branchResult.length).to.equal(5)
      })
    })
  })

  describe('failing requests', () => {
    it('should report the failure and stop the scraper', async () => {
      const config = {
        flow: [{ name: 'will-fail', download: 'https://non-existent.com/a/b/c' }]
      }
      nock('https://non-existent.com')
        .get('/a/b/c')
        .reply(500)

      const { start } = scrape(config, options, params)
      const emitter = await start()
      const { counts } = useRequestStatsRecorder(config, emitter)
      await new Promise((resolve, reject) => {
        emitter.on('error', (e: Error) => {
          expect(e).to.be.instanceof(Error)
          expect(e.name).to.equal('ResponseError')
          expect(e.message).to.include(
            `scraper 'will-fail': Request "https://non-existent.com/a/b/c" failed.`
          )
          expect(counts['will-fail'].queued).to.equal(1)
          expect(counts['will-fail'].complete).to.equal(0)
          resolve()
        })
        emitter.on('done', () => reject(`scraper should have emitted 'error' not 'done'`))
      })
    })
  })

  describe('in progress requests', () => {
    it('it should show complete = 0 in result', async () => {
      nock('https://slow-url.com')
        .get('/a')
        .delayBody(1000)
        .reply(200, '')

      const config = {
        flow: [{ name: 'slow', download: 'https://slow-url.com/a' }]
      }

      const { start, query } = scrape(config, options, params)
      const { on } = start()

      await new Promise(resolve => on('initialized', resolve))
      const queryStmt = query.prepare(['slow'])

      on('slow:queued', () => {
        const result = queryStmt()
        expect(result.length).to.equal(1)
        expect(result[0]['slow'].length).to.equal(1)
        expect(result[0]['slow'][0].complete).to.equal(0) // this is a BIT (1 | 0) column in sqlite
      })

      await new Promise(resolve => on('done', resolve))
      const result = queryStmt()
      expect(result.length).to.equal(1)
      expect(result[0]['slow'].length).to.equal(1)
      expect(result[0]['slow'][0].complete).to.equal(1)
    })

    it('should hear a "done" event even if the scraper is empty and we wait on "initialized"', async () => {
      const config = { flow: [] }
      const scraper = scrape(config, options, params)
      const { on } = scraper.start()
      await new Promise(resolve => on('initialized', resolve))
      await new Promise(resolve => on('done', resolve))
    })
  })
})
