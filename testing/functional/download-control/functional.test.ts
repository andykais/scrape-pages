import os from 'os'
import path from 'path'

import { expect } from 'chai'

import { nockMockFolder } from '../../setup'
import { config } from './config'
import expectedQueryResult from './resources/expected-query-result.json'
import { scrape } from '../../../src'
import { Start } from '../../../src/scraper'

const resourceFolder = `${__dirname}/resources/mock-endpoints`
const resourceUrl = `http://${path.basename(__dirname)}.com`

const options = {}
const params = {
  folder: path.resolve(os.tmpdir(), `scrape-pages--${path.basename(__dirname)}`),
  cleanFolder: true
}
describe('download control', () => {
  describe('first pass', () => {
    const counts = { index: { queued: 0, complete: 0 }, postTitle: { queued: 0, complete: 0 } }
    const { start, query } = scrape(config, options, params)
    before(async () => {
      await nockMockFolder(resourceFolder, resourceUrl)
      const { on } = await start()

      on('index:queued', () => counts.index.queued++)
      on('index:complete', () => counts.index.complete++)
      on('postTitle:queued', () => counts.postTitle.queued++)
      on('postTitle:complete', () => counts.postTitle.complete++)

      await new Promise(resolve => on('done', resolve))
    })

    it('should have made the expected number of requests', () => {
      expect(counts.index.queued).to.be.equal(1)
      expect(counts.index.complete).to.be.equal(1)
      expect(counts.postTitle.queued).to.be.equal(5)
      expect(counts.postTitle.complete).to.be.equal(5)
    })

    it('should group each image into a separate slot, in order', () => {
      const result = query({ scrapers: ['postTitle'] })
      expect(result).to.be.deep.equal(expectedQueryResult)
    })
  })
  describe('second pass on same folder', () => {
    const counts = { index: { queued: 0, complete: 0 }, postTitle: { queued: 0, complete: 0 } }
    const { start, query } = scrape(
      config,
      { cache: true, optionsEach: { index: { cache: false } } },
      { ...params, cleanFolder: false }
    )
    before(async () => {
      await nockMockFolder(resourceFolder, resourceUrl)
      const { on } = await start()
      on('index:queued', () => counts.index.queued++)
      on('index:complete', () => counts.index.complete++)
      on('postTitle:queued', () => counts.postTitle.queued++)
      on('postTitle:complete', () => counts.postTitle.complete++)
      await new Promise(resolve => on('done', resolve))
    })

    it(`should make a request on 'index', but not on cached postTitle`, () => {
      expect(counts.index.queued).to.be.equal(1)
      expect(counts.index.complete).to.be.equal(1)
      expect(counts.postTitle.queued).to.be.equal(0)
      expect(counts.postTitle.complete).to.be.equal(5)
    })
    it('should still equal expected postTitle entries', () => {
      const result = query({ scrapers: ['postTitle'] })
      expect(result).to.be.deep.equal(expectedQueryResult)
    })
  })

  describe('concurrency control', () => {
    const getMaxConcurrentRequests = async (start: Start) => {
      const concurrentRequests = new Set()
      const requestCountRecord: number[] = []
      await nockMockFolder(resourceFolder, resourceUrl)
      const { on } = await start()
      on('index:progress', id => requestCountRecord.push(concurrentRequests.add(id).size))
      on('index:complete', id => concurrentRequests.delete(id))
      on('postTitle:progress', id => requestCountRecord.push(concurrentRequests.add(id).size))
      on('postTitle:complete', id => concurrentRequests.delete(id))
      await new Promise(resolve => on('done', resolve))
      return Math.max(...requestCountRecord)
    }

    it('should not have more than one concurrent request', async () => {
      const { start } = scrape(config, { maxConcurrent: 1 }, params)
      const maxConcurrentRequests = await getMaxConcurrentRequests(start)
      expect(maxConcurrentRequests).to.be.equal(1)
    })
    it(`should schedule all 'postTitle' requests at once`, async () => {
      const { start } = scrape(config, { maxConcurrent: 6 }, params)
      const maxConcurrentRequests = await getMaxConcurrentRequests(start)
      expect(maxConcurrentRequests).to.be.equal(5)
    })
  })
})
