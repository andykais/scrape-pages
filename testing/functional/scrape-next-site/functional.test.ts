import { NockFolderMock } from '../../nock-folder-mock'
import PageScraper from '../../../src'
import { config } from './config'
import os from 'os'
import path from 'path'

import { expect } from 'chai'
import snapshot from 'snap-shot-it'

const removeFilename = (item: { [name: string]: { filename: string }[] }) =>
  Object.keys(item).reduce(
    (acc, key) => ({
      [key]: item[key].map(({ filename, ...rest }) => ({
        ...rest,
        filename: -1
      })),
      ...acc
    }),
    {}
  )

describe('scrape next site', () => {
  describe('with instant scraper', function() {
    let scraperQueryForFunction: any
    before(done => {
      ;(async () => {
        const endpointMock = new NockFolderMock(
          `${__dirname}/mock-endpoint-resources`,
          'http://scrape-next-site.com'
        )
        await endpointMock.init()

        const downloadDir = path.resolve(os.tmpdir(), this.fullTitle())
        const siteScraper = new PageScraper(config)
        const emitter = siteScraper.run({
          folder: downloadDir,
          cleanFolder: true
        })
        emitter.on('done', async queryFor => {
          scraperQueryForFunction = queryFor
          done()
        })
      })()
    })

    it('should group each image into a separate slot, in order', async () => {
      const result = await scraperQueryForFunction({
        scrapers: ['image'],
        // groupBy: 'image'
      })
      console.log(result[0])
      snapshot(result.map(removeFilename))
    })
    // it('should group tags and images together that were found on the same page', async () => {
    //   const result = await scraperQueryForFunction({
    //     scrapers: ['image', 'tag'],
    //     groupBy: 'image-page'
    //   })
    //   snapshot(result.map(removeFilename))
    // })
  })

  // describe('with psuedo-random delayed scraper', function() {
  //   let scraperQueryForFunction: any
  //   before(done => {
  //     ;(async () => {
  //       const endpointMock = new NockFolderMock(
  //         `${__dirname}/mock-endpoint-resources`,
  //         'http://increment-gallery-site.com',
  //         { randomSeed: 1 }
  //       )
  //       await endpointMock.init()

  //       const downloadDir = path.resolve(os.tmpdir(), this.fullTitle())
  //       const siteScraper = new PageScraper(config)
  //       const emitter = siteScraper.run({
  //         folder: downloadDir,
  //         cleanFolder: true
  //       })
  //       emitter.on('done', async queryFor => {
  //         scraperQueryForFunction = queryFor
  //         done()
  //       })
  //     })()
  //   })

  //   it('should keep images and tags together, in order', async () => {
  //     const result = await scraperQueryForFunction({
  //       scrapers: ['image', 'tag'],
  //       groupBy: 'image-page'
  //     })
  //     snapshot(result.map(removeFilename))
  //   })
  // })
})

/**
 * I need a way to say, use the cached response from certain scrapers if hit, and always download again for
 * others
 * - useCachedResponse? default to true?
 *
 * I need a way to say reuse existing store if found, if not, remove the files
 * - cleanFolder
 */
