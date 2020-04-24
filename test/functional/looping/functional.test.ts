import { expect } from 'chai'
import { FunctionalTestSetup, assertQueryResultPartial } from '@test/functional/setup'
import { queryExecutionDebugger } from '@test/query-debugger'

import { ScraperProgram } from '@scrape-pages'
import * as instructions from './instructions'

const testEnv = new FunctionalTestSetup(__dirname)

describe(__filename, () => {
  describe('query ordering', () => {
    describe('with simple instructions', () => {
      const scraper = new ScraperProgram(instructions.simple, testEnv.outputFolder)

      before(async function () {
        await testEnv.beforeEach.bind(this)()
        await scraper.start()
        await scraper.toPromise()
      })
      after(testEnv.afterEach)

      it(`query(['image', 'tag'], {groupBy: 'post'})`, async () => {
        const result = scraper.query(['image', 'tag'], { groupBy: 'post' })
        // prettier-ignore
        assertQueryResultPartial(result, [
          {
            image: [{ requestParams: '{"url":"http://looping/image/the.jpg","headers":{},"method":"GET"}' }],
            tag: [{ value: 'one' }, { value: 'two' }]
          },
          {
            image: [{ requestParams: '{"url":"http://looping/image/quick.jpg","headers":{},"method":"GET"}' }],
            tag: [{ value: 'one' }, { value: 'two' }]
          },
          {
            image: [{ requestParams: '{"url":"http://looping/image/brown.jpg","headers":{},"method":"GET"}' }],
            tag: [{ value: 'four' }, { value: 'five' }]
          },
          {
            image: [{ requestParams: '{"url":"http://looping/image/fox.jpg","headers":{},"method":"GET"}' }],
            tag: [{ value: 'three' }, { value: 'four' }, { value: 'five' }]
          }
        ])
      })
    })

    describe('with merging instructions', () => {
      const scraper = new ScraperProgram(instructions.merging, testEnv.outputFolder)

      before(async function () {
        await testEnv.beforeEach.bind(this)()
        await scraper.start()
        await scraper.toPromise()
      })
      after(testEnv.afterEach)

      it(`query(['image', 'tag'], {groupBy: 'post'})`, async () => {
        const result = scraper.query(['image', 'tag'], { groupBy: 'post' })
        // prettier-ignore
        assertQueryResultPartial(result, [
          {
            image: [
              { requestParams: '{"url":"http://looping/image/gal-1.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/the.jpg","headers":{},"method":"GET"}' },
            ],
            tag: [{ value: 'one' }, { value: 'two' }]
          },
          {
            image: [{ requestParams: '{"url":"http://looping/image/quick.jpg","headers":{},"method":"GET"}' }],
            tag: [{ value: 'one' }, { value: 'two' }]
          },
          {
            image: [
              { requestParams: '{"url":"http://looping/image/brown.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/gal-2.jpg","headers":{},"method":"GET"}' },
            ],
            tag: [{ value: 'five' }, { value: 'four' }]
          },
          {
            image: [{ requestParams: '{"url":"http://looping/image/fox.jpg","headers":{},"method":"GET"}' }],
            tag: [{ value: 'five' }, { value: 'four' }, { value: 'three' }]
          }
        ], { ignoreOrderInGroups: true })
        // TODO order merging commands and remove ignoreOrderInGroups (it is doable)
      })
      it(`query(['image'])`, async function () {
        const result = scraper.query(['image'])
        // prettier-ignore
        assertQueryResultPartial(result, [
          {
            image: [
              { requestParams: '{"url":"http://looping/image/brown.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/fox.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/gal-1.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/gal-2.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/quick.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/the.jpg","headers":{},"method":"GET"}' },
            ]
          }
        ], { ignoreOrderInGroups: true })
      })
    })

    describe('with reused labels instructions', () => {
      const scraper = new ScraperProgram(instructions.reuseLabels, testEnv.outputFolder)

      before(async function () {
        await testEnv.beforeEach.bind(this)()
        await scraper.start()
        await scraper.toPromise()
      })
      after(testEnv.afterEach)

      it(`query(['image'])`, async () => {
        const result = scraper.query(['image'])
        // prettier-ignore
        assertQueryResultPartial(result, [
          {
            image: [
              { requestParams: '{"url":"http://looping/image/the.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/quick.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/gal-1.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/brown.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/fox.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/gal-2.jpg","headers":{},"method":"GET"}' },
            ]
          }
        ])
      })
      it(`query(['image', 'tag'], {groupBy: 'post'})`, async () => {
        const result = scraper.query(['image', 'tag'], { groupBy: 'post' })

        // prettier-ignore
        assertQueryResultPartial(result, [
          {
            image: [
              { requestParams: '{"url":"http://looping/image/gal-1.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/the.jpg","headers":{},"method":"GET"}' }
            ],
            tag: [{ value: 'one' }, { value: 'two' }]
          },
          {
            image: [{ requestParams: '{"url":"http://looping/image/quick.jpg","headers":{},"method":"GET"}' }],
            tag: [{ value: 'one' }, { value: 'two' }]
          },
          {
            image: [
              { requestParams: '{"url":"http://looping/image/gal-2.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://looping/image/brown.jpg","headers":{},"method":"GET"}' }
            ],
            tag: [{ value: 'four' }, { value: 'five' }]
          },
          {
            image: [{ requestParams: '{"url":"http://looping/image/fox.jpg","headers":{},"method":"GET"}' }],
            tag: [{ value: 'three' }, { value: 'four' }, { value: 'five' }]
          }
        ])
      })
    })

    describe('query ordering', () => {
      const scraper = new ScraperProgram(instructions.withEmptyValue, testEnv.outputFolder)

      before(async function () {
        await testEnv.beforeEach.bind(this)()
        await scraper.start()
        await scraper.toPromise()
      })
      after(testEnv.afterEach)

      it(`query(['image', 'image-parse', 'tag'])`, async () => {
        const result = scraper.query(['image', 'image-parse', 'tag'])
        assertQueryResultPartial(result, [
          {
            // prettier-ignore
            image: [
            { requestParams: '{"url":"http://looping/image/the.jpg","headers":{},"method":"GET"}' },
            { requestParams: '{"url":"http://looping/image/quick.jpg","headers":{},"method":"GET"}' },
            { requestParams: '{"url":"http://looping/image/brown.jpg","headers":{},"method":"GET"}' },
            { requestParams: '{"url":"http://looping/image/fox.jpg","headers":{},"method":"GET"}' }
          ],
            'image-parse': [
              { value: '/image/the.jpg' },
              { value: '/image/quick.jpg' },
              { value: '/image/brown.jpg' },
              { value: '/image/fox.jpg' }
            ],
            tag: [
              { value: 'one' },
              { value: 'two' },
              { value: 'one' },
              { value: 'two' },
              { value: 'four' },
              { value: 'five' },
              { value: 'three' },
              { value: 'four' },
              { value: 'five' }
            ]
          }
        ])
      })
      it('non existent labels', async function () {
        assertQueryResultPartial(scraper.query(['nonexistent']), [])

        assertQueryResultPartial(scraper.query(['image-parse'], { groupBy: 'nonexistent' }), [
          {
            'image-parse': [
              { value: '/image/the.jpg' },
              { value: '/image/quick.jpg' },
              { value: '/image/brown.jpg' },
              { value: '/image/fox.jpg' }
            ]
          }
        ])

        assertQueryResultPartial(scraper.query(['nonexistent'], { groupBy: 'post' }), [
          {},
          {},
          {},
          {}
        ])
      })
      it('commands that had no values', async function () {
        const result = scraper.query(['image', 'image-parse', 'never-reached'])
        assertQueryResultPartial(result, [
          {
            // prettier-ignore
            image: [
            { requestParams: '{"url":"http://looping/image/the.jpg","headers":{},"method":"GET"}' },
            { requestParams: '{"url":"http://looping/image/quick.jpg","headers":{},"method":"GET"}' },
            { requestParams: '{"url":"http://looping/image/brown.jpg","headers":{},"method":"GET"}' },
            { requestParams: '{"url":"http://looping/image/fox.jpg","headers":{},"method":"GET"}' }
          ],
            'image-parse': [
              { value: '/image/the.jpg' },
              { value: '/image/quick.jpg' },
              { value: '/image/brown.jpg' },
              { value: '/image/fox.jpg' }
            ],
            // commands that do exist always get a field
            'never-reached': []
          }
        ])
      })
    })
  })

  describe('scraper state', () => {
    beforeEach(testEnv.beforeEach)
    afterEach(testEnv.afterEach)

    it.skip('should be able to init a scraper twice', async () => {
      const scraper1 = new ScraperProgram(instructions.simple, testEnv.outputFolder)
      await scraper1.start()
      await scraper1.toPromise()
      const result1 = scraper1.query(['tag'])

      await scraper1.start()
      await scraper1.toPromise()

      const scraper2 = new ScraperProgram(instructions.simple, testEnv.outputFolder)
      const result2 = scraper2.query(['tag'])

      expect(result1).to.be.deep.equal(result2)
    })
  })
})
