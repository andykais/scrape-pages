import * as path from 'path'

import { expect } from 'chai'
import nock from 'nock'
import { RUN_OUTPUT_FOLDER, NockFolderMock, useRequestStatsRecorder } from '../../setup'
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

      const testCompletedPromise = new Promise(resolve => scraper.on('done', resolve))
      expect(scraper).to.haveEvent('index:queued', 1, testCompletedPromise)
      expect(scraper).to.haveEvent('index:complete', 1, testCompletedPromise)
      expect(scraper).to.haveEvent('postTitle:queued', 5, testCompletedPromise)
      expect(scraper).to.haveEvent('postTitle:complete', 5, testCompletedPromise)

      scraper.start()
      await testCompletedPromise

      const result = scraper.query(...queryArgs)
      expect(result).to.equalQueryResult(expected[JSON.stringify(queryArgs)])
    })

    step('with all scrapers cache: true, no requests should happen', async () => {
      const scraper = new ScraperProgram(config, { cache: true }, { ...params, cleanFolder: false })
      const resultPre = scraper.query(...queryArgs)
      expect(resultPre).to.equalQueryResult(expected[JSON.stringify(queryArgs)])

      const testCompletePromise = new Promise(resolve => scraper.on('done', resolve))
      expect(scraper).to.haveEvent('index:queued', 0, testCompletePromise)
      expect(scraper).to.haveEvent('index:complete', 1, testCompletePromise)
      expect(scraper).to.haveEvent('postTitle:queued', 0, testCompletePromise)
      expect(scraper).to.haveEvent('postTitle:complete', 5, testCompletePromise)

      scraper.start()
      await testCompletePromise

      const result = scraper.query(...queryArgs)
      expect(result).to.equalQueryResult(expected[JSON.stringify(queryArgs)])
    })

    step('should make requests for scrapers with cache turned off', async () => {
      const scraper = new ScraperProgram(
        config,
        { logLevel: 'info', cache: true, optionsEach: { index: { cache: false } } },
        { ...params, cleanFolder: false }
      )

      const testCompletedPromise = new Promise(resolve => scraper.on('done', resolve))

      expect(scraper).to.haveEvent('index:queued', 1, testCompletedPromise)
      expect(scraper).to.haveEvent('index:complete', 1, testCompletedPromise)
      expect(scraper).to.haveEvent('postTitle:queued', 0, testCompletedPromise)
      expect(scraper).to.haveEvent('postTitle:complete', 5, testCompletedPromise)

      scraper.start()
      await testCompletedPromise

      const result = scraper.query(...queryArgs)
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
        const scraper = new ScraperProgram(config, options, params)
        scraper.on('index:queued', () => scraper.emit('stop'))
        scraper.start()
        await new Promise(resolve => scraper.on('done', resolve))

        const resultIndex = scraper.query(['index'])
        expect(resultIndex[0]['index'][0].complete).to.equal(0)
        const result = scraper.query(['postTitle'], { groupBy: 'postTitle' })
        expect(result.length).to.equal(0)
      })
    })
    describe(`emit('stop:<scraper>')`, () => {
      it('should only stop the postTitle scraper', async () => {
        const scraper = new ScraperProgram(configBranching, options, params)
        const emitter = scraper.emitter

        scraper.on('index:queued', () => scraper.emit('stop:postTitle'))

        const testCompletePromise = new Promise(resolve => scraper.on('done', resolve))
        expect(scraper).to.haveEvent('index:queued', 1, testCompletePromise)
        expect(scraper).to.haveEvent('postTitle:queued', 0, testCompletePromise)
        expect(scraper).to.haveEvent('postTitle_dup:queued', 5, testCompletePromise)
        scraper.start()
        await testCompletePromise

        // const { counts } = useRequestStatsRecorder(configBranching, emitter)
        // // emitter.emit('stop:postTitle')
        // // TODO stop is still fickle on continuous runs...sometimes postTitle queues get through
        // emitter.on('index:queued', () => scraper.emit('stop:postTitle'))
        // await new Promise(resolve => scraper.on('done', resolve))

        // expect(counts.index.queued).to.equal(1)
        // expect(counts.postTitle.queued).to.equal(0)
        // expect(counts.postTitle_dup.queued).to.equal(5)

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

      const onErrorPromise = new Promise((resolve, reject) => {
        scraper.on('error', (e: Error) => {
          expect(e).to.be.instanceof(Error)
          expect(e.name).to.equal('ResponseError')
          expect(e.message).to.include(
            `scraper 'will-fail': Request "https://non-existent.com/a/b/c" failed.`
          )
          resolve()
        })
        scraper.on('done', () => reject(`scraper should have emitted 'error' not 'done'`))
      })

      expect(scraper).to.haveEvent('will-fail:queued', 1, onErrorPromise)
      expect(scraper).to.haveEvent('will-fail:complete', 0, onErrorPromise)

      scraper.start()
      await onErrorPromise
    })
  })

  describe('throw up errors to emitter', () => {
    it.only('should not affect the scraper', async () => {
      const scraper = new ScraperProgram(config, options, params)

      const testCompletedPromise = new Promise(resolve => scraper.on('done', resolve))
      expect(process).to.haveEvents('unhandledRejection', 1, testCompletedPromise)

      scraper.on('index:queued', () => {
        throw new Error('WEE')
      })
      process.on('unhandledRejection', () => {

      })

      scraper.start()
      await new Promise(resolve => scraper.on('done', resolve))
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

      scraper.start()
      // await new Promise(resolve => scraper.on('initialized', resolve))
      const queryStmt = scraper.query.prepare(['slow'])

      scraper.on('slow:queued', () => {
        const result = queryStmt()
        expect(result.length).to.equal(1)
        expect(result[0]['slow'].length).to.equal(1)
        expect(result[0]['slow'][0].complete).to.equal(0) // this is a BIT (1 | 0) column in sqlite
      })

      await new Promise(resolve => scraper.on('done', resolve))
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

      const testCompletePromise = new Promise(resolve => scraper1.on('done', resolve))
      expect(scraper1).to.haveEvent('initialized', 1, testCompletePromise)
      expect(scraper2).to.haveEvent('error', 1, testCompletePromise)
      scraper2.on('error', error => {
        expect(error).to.be.a.instanceof(ActiveScraperLockError)
      })

      scraper1.start()
      scraper1.on('initialized', () => {
        scraper2.start()
      })
      await testCompletePromise

      // let error: Error | null = null
      // scraper2.on('error', e => (error = e))
      // const testCompletePromise =  Promise.all([
      //   new Promise(resolve => scraper1.on('initialized', resolve)),
      //   new Promise(resolve => scraper2.on('done', resolve))
      // ])
      // scraper2.start()
      // await testCompletePromise
      // expect(error).to.be.an.instanceof(ActiveScraperLockError)
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

      scraper1.start()
      await new Promise(resolve => scraper1.on('initialized', resolve))
      scraper2.start()

      const endOfTestPromise = Promise.all([
        new Promise(resolve => scraper1.on('done', resolve)),
        new Promise(resolve => scraper2.on('done', resolve))
      ])

      expect(scraper1).to.haveEvent('done', 1, endOfTestPromise)
      expect(scraper1).to.haveEvent('error', 0, endOfTestPromise)
      expect(scraper2).to.haveEvent('done', 1, endOfTestPromise)
      expect(scraper2).to.haveEvent('error', 0, endOfTestPromise)

      // TODO perhaps this is unnecessary...
      await endOfTestPromise
    })
  })
})
