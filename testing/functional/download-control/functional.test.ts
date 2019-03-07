import * as os from 'os'
import * as path from 'path'

import { expect } from 'chai'

import { nockMockFolder } from '../../setup'
import { config } from './config'
import * as querySnapshot from './resources/expected-query-result.json'
import { scrape } from '../../../src'
import { Start } from '../../../src/scraper'
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

const getRequestStats = async (config: ConfigInit, start: Start) => {
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
  const { on } = await start()
  const concurrentRequests = new Set()
  let maxConcurrentRequests = 0
  for (const scraperName of scraperNames) {
    on(`${scraperName}:queued`, () => {
      counts[scraperName].queued++
    })
    on(`${scraperName}:complete`, id => {
      counts[scraperName].complete++
      concurrentRequests.delete(id)
    })
    on(`${scraperName}:progress`, id => {
      maxConcurrentRequests = Math.max(maxConcurrentRequests, concurrentRequests.add(id).size)
    })
  }
  await new Promise(resolve => on('done', resolve))
  return { counts, maxConcurrentRequests }
}
describe('download control', () => {
  describe('first pass', () => {
    const { start, query } = scrape(config, options, params)

    it('should have made the expected number of requests', async () => {
      await nockMockFolder(resourceFolder, resourceUrl)
      const { counts } = await getRequestStats(config, start)
      expect(counts.index.queued).to.be.equal(1)
      expect(counts.index.complete).to.be.equal(1)
      expect(counts.postTitle.queued).to.be.equal(5)
      expect(counts.postTitle.complete).to.be.equal(5)

      const result = query({ scrapers: ['postTitle'] })
      expect(result).to.be.deep.equal(expectedQueryResult)
    })
  })
  describe('second pass on same folder', () => {
    const { start, query } = scrape(
      config,
      { cache: true, optionsEach: { index: { cache: false } } },
      { ...params, cleanFolder: false }
    )

    it(`should make a request on 'index', but not on cached postTitle`, async () => {
      await nockMockFolder(resourceFolder, resourceUrl)
      const { counts } = await getRequestStats(config, start)
      expect(counts.index.queued).to.be.equal(1)
      expect(counts.index.complete).to.be.equal(1)
      expect(counts.postTitle.queued).to.be.equal(0)
      expect(counts.postTitle.complete).to.be.equal(5)

      const result = query({ scrapers: ['postTitle'] })
      expect(result).to.be.deep.equal(expectedQueryResult)
    })
  })

  describe('concurrency control', () => {
    it('should not have more than one concurrent request', async () => {
      const { start } = scrape(config, { maxConcurrent: 1 }, params)
      await nockMockFolder(resourceFolder, resourceUrl)
      const { maxConcurrentRequests } = await getRequestStats(config, start)
      expect(maxConcurrentRequests).to.be.equal(1)
    })
    it(`should schedule all 'postTitle' requests at once`, async () => {
      const { start } = scrape(config, { maxConcurrent: 6 }, params)
      await nockMockFolder(resourceFolder, resourceUrl)
      const { maxConcurrentRequests } = await getRequestStats(config, start)
      // though max concurrent is 6, `index` will complete before the five image requests are queued
      expect(maxConcurrentRequests).to.be.equal(5)
    })
  })
})
