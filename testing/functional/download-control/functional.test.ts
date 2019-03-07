import * as os from 'os'
import * as path from 'path'

import { expect } from 'chai'

import { nockMockFolder } from '../../setup'
import { config } from './config'
import * as querySnapshot from './resources/expected-query-result.json'
import { scrape } from '../../../src'
import { Emitter } from '../../../src/scraper'
import { ConfigInit } from '../../../src/settings/config/types'

// fixes webpack json import error https://github.com/webpack/webpack/issues/8504
const expectedQueryResult = Array.from((querySnapshot as any).default as typeof querySnapshot)

const resourceFolder = `${__dirname}/resources/mock-endpoints`
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
      stats.maxConcurrentRequests = Math.max(
        stats.maxConcurrentRequests,
        concurrentRequests.add(id).size
      )
    })
  }
  return stats
}
describe('download control', () => {
  describe('cache control', () => {
    beforeEach(async () => await nockMockFolder(resourceFolder, resourceUrl))

    it('first pass should have made the expected number of requests', async () => {
      const { start, query } = scrape(config, options, params)
      const { on } = await start()
      const { counts } = useRequestStatsRecorder(config, on)
      await new Promise(resolve => on('done', resolve))
      expect(counts.index.queued).to.be.equal(1)
      expect(counts.index.complete).to.be.equal(1)
      expect(counts.postTitle.queued).to.be.equal(5)
      expect(counts.postTitle.complete).to.be.equal(5)

      const result = query({ scrapers: ['postTitle'] })
      expect(result).to.be.deep.equal(expectedQueryResult)
    })
    it(`second pass on same folder should make a request on 'index', but not on cached postTitle`, async () => {
      const { start, query } = scrape(
        config,
        { cache: true, optionsEach: { index: { cache: false } } },
        { ...params, cleanFolder: false }
      )
      const { on } = await start()
      const { counts } = useRequestStatsRecorder(config, on)
      await new Promise(resolve => on('done', resolve))
      expect(counts.index.queued).to.be.equal(1)
      expect(counts.index.complete).to.be.equal(1)
      expect(counts.postTitle.queued).to.be.equal(0)
      expect(counts.postTitle.complete).to.be.equal(5)

      const result = query({ scrapers: ['postTitle'] })
      expect(result).to.be.deep.equal(expectedQueryResult)
    })
  })

  describe('concurrency control', function() {
    this.timeout(5000)
    beforeEach(async () => await nockMockFolder(resourceFolder, resourceUrl, { delay: 1000 }))

    it('should not have more than one concurrent request', async () => {
      const { start } = scrape(config, { maxConcurrent: 1 }, params)
      const { on } = await start()
      const stats = useRequestStatsRecorder(config, on)
      await new Promise(resolve => on('done', resolve))
      expect(stats.maxConcurrentRequests).to.be.equal(1)
    })
    // NOTE: it would be nice to test higher maxConcurrent values,
    // but we cannot expect requests to be scheduled at the same time.
    it.only(`{ maxConcurrent: 6 } should schedule all 'postTitle' requests at once`, async () => {
      const { start } = scrape(config, { maxConcurrent: 6 }, params)
      const { on } = await start()
      const stats = useRequestStatsRecorder(config, on)
      const posts = {}
      on('postTitle:queued', id => posts[id] = process.hrtime())
      let prev
      let timer = process.hrtime()
      on('postTitle:complete', id => {
        console.log('complete', id)
        const complete = process.hrtime(posts[id])
        console.log('complete', id, complete[0] + complete[1] / 1e9)
        const between = process.hrtime(timer)
        console.log('between', id,'and', prev, between[0] + between[1] / 1e9)
        timer = process.hrtime()
        prev = id
      })

      await new Promise(resolve => on('done', resolve))
      // though max concurrent is 6, `index` will complete before the five image requests are queued
      expect(stats.maxConcurrentRequests).to.be.equal(5)
    })
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
        expect(resultIndex.length).to.be.equal(0)
        const result = query({ scrapers: ['postTitle'], groupBy: 'postTitle' })
        expect(result.length).to.be.equal(0)
      })
    })
    describe(`emit('stop:postTitle')`, () => {
      it('should only stop the postTitle scraper', async () => {
        const { start, query } = scrape(config, options, params)
        // nock sends an instant reply, this is not realistic and harder to test, so a delay is added
        // await nockMockFolder(resourceFolder, resourceUrl, { delay: 100 })
        const { on, emit } = await start()
        on('index:queued', () => emit('stop'))
        await new Promise(resolve => on('done', resolve))

        const resultIndex = query({ scrapers: ['index'] })
        expect(resultIndex.length).to.be.equal(0)
        const result = query({ scrapers: ['postTitle'], groupBy: 'postTitle' })
        expect(result.length).to.be.equal(0)
      })
    })
  })
})
