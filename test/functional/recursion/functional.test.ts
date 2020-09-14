import { FunctionalTestSetup, assertQueryResultPartial } from '@test/functional/setup'
import { ScraperProgram } from '@scrape-pages'
import * as instructions from './instructions'

const testEnv = new FunctionalTestSetup(__dirname)

describe(__filename, () => {
  describe('query ordering', () => {
    describe('with simple instructions', () => {
      let scraper: ScraperProgram

      before(async function () {
        await testEnv.beforeEach.bind(this)()
        scraper = testEnv.addScraper(instructions.simple, testEnv.outputFolder)
        await scraper.start().toPromise()
      })
      after(testEnv.afterEach)

      it(`query(['image', 'title'], {groupBy: 'post'})`, () => {
        const result = scraper.query(['image', 'title'], {
          groupBy: 'post',
        })
        // prettier-ignore
        assertQueryResultPartial(result, [
          {
            image: [
              { requestParams: '{"url":"http://recursion/image/brown.jpg","headers":{},"method":"GET"}' },
            ],
            title: [{ value: 'Brown' }],
          },
          {
            image: [{
              requestParams: '{"url":"http://recursion/image/fox.jpg","headers":{},"method":"GET"}',
            }],
            title: [{ value: 'Fox' }]
          },
          {
            image: [{
              requestParams: '{"url":"http://recursion/image/jumped.jpg","headers":{},"method":"GET"}',
            }],
            title: [{ value: 'Jumped' }]
          },
          {
            image: [{
              requestParams: '{"url":"http://recursion/image/over.jpg","headers":{},"method":"GET"}',
            }],
            title: [{ value: 'Over' }]
          }
        ])
      })
      it(`query(['image'])`, async () => {
        const result = scraper.query(['image'])

        // prettier-ignore
        assertQueryResultPartial(result, [
          {
            image: [
              { requestParams: '{"url":"http://recursion/image/brown.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://recursion/image/fox.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://recursion/image/jumped.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://recursion/image/over.jpg","headers":{},"method":"GET"}' }
            ]
          }
        ])
      })
    })
    describe('with merging instructions', async () => {
      let scraper: ScraperProgram

      before(async function () {
        scraper = testEnv.addScraper(instructions.merging, testEnv.outputFolder)
        await testEnv.beforeEach.bind(this)()
        await scraper.start().toPromise()
      })
      after(testEnv.afterEach)

      it(`query(['image', 'title'], {groupBy: 'post'})`, async () => {
        const result = scraper.query(['image', 'title'], { groupBy: 'post' })
        // prettier-ignore
        assertQueryResultPartial(result, [
          {
            image: [
              { requestParams: '{"url":"http://recursion/image/the.jpg","headers":{},"method":"GET"}' },
            ],
            title: [{ value: 'The' }],
          },
          {
            image: [
              { requestParams: '{"url":"http://recursion/image/quick.jpg","headers":{},"method":"GET"}' },
            ],
            title: [{ value: 'Quick' }],
          },
          {
            image: [
              { requestParams: '{"url":"http://recursion/image/brown.jpg","headers":{},"method":"GET"}' },
            ],
            title: [{ value: 'Brown' }],
          },
          {
            image: [{
              requestParams: '{"url":"http://recursion/image/fox.jpg","headers":{},"method":"GET"}',
            }],
            title: [{ value: 'Fox' }]
          },
          {
            image: [{
              requestParams: '{"url":"http://recursion/image/jumped.jpg","headers":{},"method":"GET"}',
            }],
            title: [{ value: 'Jumped' }]
          },
          {
            image: [{
              requestParams: '{"url":"http://recursion/image/over.jpg","headers":{},"method":"GET"}',
            }],
            title: [{ value: 'Over' }]
          }
        ])
      })

      it(`query(['image'])`, async () => {
        const result = scraper.query(['image'])

        // prettier-ignore
        assertQueryResultPartial(result, [
          {
            image: [
              { requestParams: '{"url":"http://recursion/image/the.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://recursion/image/quick.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://recursion/image/brown.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://recursion/image/fox.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://recursion/image/jumped.jpg","headers":{},"method":"GET"}' },
              { requestParams: '{"url":"http://recursion/image/over.jpg","headers":{},"method":"GET"}' }
            ]
          }
        ])
      })
    })
  })
})
