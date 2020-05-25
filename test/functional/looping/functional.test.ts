import { FunctionalTestSetup, assertQueryResultPartial } from '@test/functional/setup'

import { ScraperProgram } from '@scrape-pages'
import * as instructions from './instructions'

const testEnv = new FunctionalTestSetup(__dirname)

// TODO refactor these to put the scraper inside the test block (and only use one test per each instruction)
describe(__filename, () => {
  describe('query ordering', () => {
    describe('with simple instructions', () => {
      let scraper: ScraperProgram

      before(async function () {
        scraper = new ScraperProgram(instructions.simple, testEnv.outputFolder)
        await testEnv.beforeEach.bind(this)()
        await scraper.start().toPromise()
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
      let scraper: ScraperProgram

      before(async function () {
        scraper = new ScraperProgram(instructions.merging, testEnv.outputFolder)
        await testEnv.beforeEach.bind(this)()
        await scraper.start().toPromise()
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
      let scraper: ScraperProgram

      before(async function () {
        scraper = new ScraperProgram(instructions.reuseLabels, testEnv.outputFolder)
        await testEnv.beforeEach.bind(this)()
        await scraper.start().toPromise()
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
      let scraper: ScraperProgram

      before(async function () {
        scraper = new ScraperProgram(instructions.withEmptyValue, testEnv.outputFolder)
        await testEnv.beforeEach.bind(this)()
        await scraper.start().toPromise()
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
})
