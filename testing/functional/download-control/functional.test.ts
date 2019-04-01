import * as os from 'os'
import * as path from 'path'

import { expect } from 'chai'

import * as nock from 'nock'
import { nockMockFolder, configureSnapshots, stripResult } from '../../setup'
import { config } from './config'
import { scrape } from '../../../src'
import { Emitter } from '../../../src/scraper'
import { ConfigInit } from '../../../src/settings/config/types'

const resourceFolder = `${__dirname}/fixtures`
const resourceUrl = `http://${path.basename(__dirname)}.com`

const options = {}
const params = {
  folder: path.resolve(os.tmpdir(), `scrape-pages--${path.basename(__dirname)}`),
  cleanFolder: true
}

const useRequestStatsRecorder = (config: ConfigInit, on: Emitter['on']) => {
  const scraperNames = Object.keys(config.scrapers)
  const counts = scraperNames.reduce(
    (acc, scraperName) => {
      acc[scraperName] = { queued: 0, complete: 0 }
      return acc
    },
    {} as {
      [scraperName: string]: { queued: number; complete: number }
    }
  )
  const stats = { counts, maxConcurrentRequests: 0 }
  const concurrentRequests = new Set()
  for (const scraperName of scraperNames) {
    on(`${scraperName}:queued`, () => {
      stats.counts[scraperName].queued++
    })
    on(`${scraperName}:complete`, id => {
      stats.counts[scraperName].complete++
      concurrentRequests.delete(id)
    })
    on(`${scraperName}:progress`, id => {
      concurrentRequests.add(id)
      stats.maxConcurrentRequests = Math.max(stats.maxConcurrentRequests, concurrentRequests.size)
    })
  }
  return stats
}
describe('download control', () => {
  beforeEach(function() {
    configureSnapshots({ __dirname, __filename, fullTitle: this.currentTest!.fullTitle() })
  })

  describe('cache control', () => {
    step('first pass should fetch all downloads since nothing is in cache', async () => {
      const { start, query } = scrape(config, { cache: true }, params)
      await nockMockFolder(resourceFolder, resourceUrl)
      const { on } = await start()
      const { counts } = useRequestStatsRecorder(config, on)
      await new Promise(resolve => on('done', resolve))
      expect(counts.index.queued).to.equal(1)
      expect(counts.index.complete).to.equal(1)
      expect(counts.postTitle.queued).to.equal(5)
      expect(counts.postTitle.complete).to.equal(5)
      const result = query({ scrapers: ['postTitle'] })
      expect(stripResult(result)).to.matchSnapshot()
    })

    step('with all scrapers cache: true, no requests should happen', async () => {
      const { start, query } = scrape(config, { cache: true }, { ...params, cleanFolder: false })
      await nockMockFolder(resourceFolder, resourceUrl)
      const { on } = await start()
      const { counts } = useRequestStatsRecorder(config, on)
      await new Promise(resolve => on('done', resolve))
      expect(counts.index.queued).to.equal(0)
      expect(counts.index.complete).to.equal(1)
      expect(counts.postTitle.queued).to.equal(0)
      expect(counts.postTitle.complete).to.equal(5)
      const result = query({ scrapers: ['postTitle'] })
      expect(stripResult(result)).to.matchSnapshot()
    })

    step(
      `second pass on same folder should request 'index', but not cached postTitle`,
      async () => {
        const { start, query } = scrape(
          config,
          { logLevel: 'info', cache: true, optionsEach: { index: { cache: false } } },
          { ...params, cleanFolder: false }
        )
        await nockMockFolder(resourceFolder, resourceUrl)
        const { on } = await start()
        const { counts } = useRequestStatsRecorder(config, on)
        await new Promise(resolve => on('done', resolve))
        expect(counts.index.queued).to.equal(1)
        expect(counts.index.complete).to.equal(1)
        expect(counts.postTitle.queued).to.equal(0)
        expect(counts.postTitle.complete).to.equal(5)
        const result = query({ scrapers: ['postTitle'] })
        expect(stripResult(result)).to.matchSnapshot()
      }
    )
  })

  describe('emit stop event', () => {
    // nock sends an instant reply, this is not realistic and harder to test, so a delay is added
    beforeEach(async () => await nockMockFolder(resourceFolder, resourceUrl, { delay: 200 }))

    describe(`emit('stop')`, () => {
      it(`should stop the whole scraper if triggered before any 'complete' event`, async () => {
        const { start, query } = scrape(config, options, params)
        const { on, emit } = await start()
        on('index:queued', () => emit('stop'))
        await new Promise(resolve => on('done', resolve))

        const resultIndex = query({ scrapers: ['index'] })
        expect(resultIndex.length).to.equal(0)
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
        scrapers: { 'will-fail': { download: { urlTemplate: 'https://non-existent.com/a/b/c' } } },
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
})
