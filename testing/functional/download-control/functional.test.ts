import * as path from 'path'
import * as fs from '../../../src/util/fs'
import { UninitializedDatabaseError } from '../../../src/util/errors'

import { expect } from 'chai'
import nock from 'nock'
import { RUN_OUTPUT_FOLDER, NockFolderMock, recordEvents } from '../../setup'
import { config, configBranching } from './config'
import { expected } from './expected-query-results'
import { ScraperProgram, ActiveScraperLockError } from '../../../src'
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
  // this may not be necessary
  it.skip('should hear a "done" event even if the scraper is empty and we wait on "initialized"', async () => {
    const config = { flow: [] }
    const scraper = new ScraperProgram(config, options, params)
    await new Promise(resolve => scraper.on('initialized', resolve))
    await new Promise(resolve => scraper.on('done', resolve))
  })

  describe('cache control', () => {
    const siteMock = new NockFolderMock(resourceFolder, resourceUrl)
    beforeEach(siteMock.init)
    afterEach(siteMock.done)

    const queryArgs: QueryArgs = [['postTitle']]
    step('first pass should fetch all downloads since nothing is in cache', async () => {
      const scraper = new ScraperProgram(config, { cache: true }, params)
      const events = recordEvents(scraper)

      scraper.start()
      await scraper.getCompletionPromise()

      expect(events).to.haveEvent('index:queued', 1)
      expect(events).to.haveEvent('index:complete', 1)
      expect(events).to.haveEvent('postTitle:queued', 5)
      expect(events).to.haveEvent('postTitle:complete', 5)

      const result = scraper.query(...queryArgs)
      expect(result).to.equalQueryResult(expected[JSON.stringify(queryArgs)])
    })

    step('with all scrapers cache: true, no requests should happen', async () => {
      const scraper = new ScraperProgram(config, { cache: true }, { ...params, cleanFolder: false })
      const resultPre = scraper.query(...queryArgs)
      expect(resultPre).to.equalQueryResult(expected[JSON.stringify(queryArgs)])

      const events = recordEvents(scraper)

      scraper.start()
      await scraper.getCompletionPromise()

      expect(events).to.haveEvent('index:queued', 0)
      expect(events).to.haveEvent('index:complete', 1)
      expect(events).to.haveEvent('postTitle:queued', 0)
      expect(events).to.haveEvent('postTitle:complete', 5)

      const result = scraper.query(...queryArgs)
      expect(result).to.equalQueryResult(expected[JSON.stringify(queryArgs)])
    })

    step('should make requests for scrapers with cache turned off', async () => {
      const scraper = new ScraperProgram(
        config,
        { logLevel: 'info', cache: true, optionsEach: { index: { cache: false } } },
        { ...params, cleanFolder: false }
      )
      const events = recordEvents(scraper)

      scraper.start()
      await scraper.getCompletionPromise()

      expect(events).to.haveEvent('index:queued', 1)
      expect(events).to.haveEvent('index:complete', 1)
      expect(events).to.haveEvent('postTitle:queued', 0)
      expect(events).to.haveEvent('postTitle:complete', 5)

      const result = scraper.query(...queryArgs)
      expect(result).to.deep.equal(expected[JSON.stringify(queryArgs)])
    })
  })

  describe('stopping the scraper', () => {
    // nock sends an instant reply, this is not realistic and harder to test, so a delay is added
    const siteMock = new NockFolderMock(resourceFolder, resourceUrl, { delay: 200 })

    beforeEach(async () => {
      await fs.rmrf(params.folder)
      await siteMock.init()
    })
    afterEach(siteMock.done)

    describe('with stop()', () => {
      it('should stop the whole scraper', async () => {
        const scraper = new ScraperProgram(config, options, params)
        const events = recordEvents(scraper)

        await scraper.start()
        // TODO this test currently breaks if stop() is called before awaiting start (this is fixed w/ fetch abort)
        scraper.stop()
        await new Promise((resolve, reject) => scraper.on('done', resolve).on('error', reject))

        expect(events).to.haveEvent('done', 1)
        expect(events).to.haveEvent('index:complete', 0)

        const result = scraper.query(['postTitle'], { groupBy: 'postTitle' })
        expect(result.length).to.equal(0)
      })
    })

    describe('with stopScraper()', () => {
      it('should stop the named scraper only', async function() {
        const scraper = new ScraperProgram(configBranching, options, params)
        await siteMock.init()

        const events = recordEvents(scraper)

        scraper.on('index:queued', () => scraper.stopScraper('postTitle'))

        await Promise.all([
          scraper.start(),
          new Promise((resolve, reject) => scraper.on('done', resolve).on('error', reject))
        ])

        expect(events).to.haveEvent('index:queued', 1)
        expect(events).to.haveEvent('index:complete', 1)
        expect(events).to.haveEvent('postTitle:queued', 0)
        expect(events).to.haveEvent('postTitle:complete', 0)
        expect(events).to.haveEvent('postTitle_dup:queued', 5)
        expect(events).to.haveEvent('postTitle_dup:complete', 5)

        const indexResult = scraper.query(['index'], { groupBy: 'index' })
        expect(indexResult.length).to.equal(5)
        const result = scraper.query(['postTitle'], { groupBy: 'postTitle' })
        expect(result.length).to.equal(0)
        const branchResult = scraper.query(['postTitle_dup'], { groupBy: 'postTitle_dup' })
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

      const scraper = new ScraperProgram(config, options, params)
      const events = recordEvents(scraper)

      scraper.start()

      try {
        await scraper.getCompletionPromise()
        throw new Error(`scraper should have emitted 'error' not 'done'`)
      } catch (e) {
        expect(e).to.be.instanceof(Error)
        expect(e.name).to.equal('ResponseError')
        expect(e.message).to.include(
          `scraper 'will-fail': Request "https://non-existent.com/a/b/c" failed.`
        )
      }

      expect(events).to.haveEvent('will-fail:queued', 1)
      expect(events).to.haveEvent('will-fail:complete', 0)
    })
  })

  describe('throw up errors to emitter', () => {
    const siteMock = new NockFolderMock(resourceFolder, resourceUrl)
    beforeEach(siteMock.init)
    afterEach(siteMock.done)
    afterEach(() => process.removeAllListeners('unhandledRejection'))

    it('should not affect the scraper', async () => {
      const scraper = new ScraperProgram(config, options, params)

      let unhandledRejection: any
      process.on('unhandledRejection', error => (unhandledRejection = error))

      const errorMsg = 'Im a nasty bug!'
      scraper.on('index:queued', () => {
        throw new Error(errorMsg)
      })
      scraper.start()
      await scraper.getCompletionPromise()

      expect(unhandledRejection).to.be.instanceof(Error)
      expect(unhandledRejection!.message).to.equal(errorMsg)
    })
  })
  describe('in progress requests', () => {
    it('it should show complete = 0 in result', async () => {
      nock('https://slow-url.com')
        .get('/a')
        .delayBody(500)
        .reply(200, '')

      const config = {
        flow: [{ name: 'slow', download: 'https://slow-url.com/a' }]
      }

      const scraper = new ScraperProgram(config, options, params)

      await scraper.start()
      const queryStmt = scraper.query.prepare(['slow'])

      scraper.on('slow:queued', () => {
        const result = queryStmt()
        expect(result.length).to.equal(1)
        expect(result[0]['slow'].length).to.equal(1)
        expect(result[0]['slow'][0].complete).to.equal(0) // this is a BIT (1 | 0) column in sqlite
      })

      await scraper.getCompletionPromise()
      const result = queryStmt()
      expect(result.length).to.equal(1)
      expect(result[0]['slow'].length).to.equal(1)
      expect(result[0]['slow'][0].complete).to.equal(1)
    })

    it('should prevent two scrapers from running simultaneously', async () => {
      nock('https://slow-url.com')
        .get('/a')
        .times(2)
        .delayBody(500)
        .reply(200, '')

      const config = {
        flow: [{ name: 'slow', download: 'https://slow-url.com/a' }]
      }

      const scraper1 = new ScraperProgram(config, options, params)
      const scraper2 = new ScraperProgram(config, options, params)

      const scraper1CompletionPromise = scraper1.getCompletionPromise()
      const scraper2CompletionPromise = scraper2.getCompletionPromise()

      scraper1.start()
      scraper1.on('initialized', () => {
        scraper2.start()
      })

      try {
        await scraper2CompletionPromise
        throw new Error('expected scraper2 to error because of another actively running scraper')
      } catch (error) {
        expect(error).to.be.a.instanceof(ActiveScraperLockError)
      }
      await scraper1CompletionPromise
    })

    it('should allow two scrapers to run simultaneously with forceStart: true', async () => {
      nock('https://slow-url.com')
        .get('/a')
        .times(2)
        .delayBody(500)
        .reply(200, '')

      const config = {
        flow: [{ name: 'slow', download: 'https://slow-url.com/a' }]
      }

      const scraper1 = new ScraperProgram(config, options, params)
      const scraper2 = new ScraperProgram(config, options, { ...params, forceStart: true })

      const events1 = recordEvents(scraper1)
      const events2 = recordEvents(scraper2)

      scraper1.start()
      await new Promise(resolve => scraper1.on('initialized', resolve))
      scraper2.start()

      await Promise.all([scraper1.getCompletionPromise(), scraper2.getCompletionPromise()])

      expect(events1).to.haveEvent('done', 1)
      expect(events1).to.haveEvent('error', 0)

      expect(events2).to.haveEvent('done', 1)
      expect(events2).to.haveEvent('error', 0)
    })
  })
  describe('querying from a separate class instance', () => {
    const siteMock = new NockFolderMock(resourceFolder, resourceUrl)
    beforeEach(async () => {
      await fs.rmrf(params.folder)
      await siteMock.init()
    })
    afterEach(siteMock.done)

    it('should return the same result as the scraping class instance', async () => {
      const scraperBase = new ScraperProgram(config, options, params)
      const scraperQueryOnly = new ScraperProgram(config, options, params)

      expect(() => scraperQueryOnly.query(['postTitle'])).to.throw(UninitializedDatabaseError)

      await scraperBase.start()
      await new Promise(resolve => scraperBase.on('done', resolve))

      const result = scraperQueryOnly.query(['postTitle'])
      expect(result).to.deep.equal(expected[JSON.stringify([['postTitle']])])
    })
  })
})
