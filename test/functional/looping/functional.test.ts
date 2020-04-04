import { expect } from 'chai'
// import { HttpFolderMock } from '@test/setup'
import { FunctionalTestSetup } from '@test/functional/setup'

import { ScraperProgram } from '@scrape-pages'
import { queryExecutionDebugger } from '@test/query-debugger'

const TEST_NAME = 'looping'
const testEnv = new FunctionalTestSetup(TEST_NAME, __dirname)

function assertQueryResultPartial(queryResult: any, expectedPartial: any) {
  expect(queryResult).to.have.length(expectedPartial.length)
  for (let i = 0; i < expectedPartial.length; i++) {
    const expectedGroup = expectedPartial[i]
    const actualGroup = queryResult[i]

    const expectedKeys = Object.keys(expectedGroup)
    const actualKeys = Object.keys(actualGroup)
    expect(expectedKeys).to.be.deep.equal(actualKeys)
    for (const key of expectedKeys) {
      const expectedLabelRows = expectedGroup[key]
      const actualLabelRows = actualGroup[key]
      expect(actualLabelRows).to.have.length(expectedLabelRows.length)
      for (let row = 0; row < expectedLabelRows.length; row++) {
        const expectedPartialRow = expectedLabelRows[row]
        const actualRow = actualLabelRows[row]
        for (const key in expectedPartialRow) {
          expect(actualRow).to.have.property(key, expectedPartialRow[key])
        }
      }
    }
  }
}

// expect(result).to.be.deep.partialEqual([{image: }])

// if you want the loop to happen per each input, put it in a branch!
// it might be difficult to say "loop 5 times and ignore request failures"
const instructions = `
().loop(
  FETCH '${testEnv.mockHost}/gallery/page/{{"+" index 1}}.html' LABEL='gallery-get'
).until('{{ index }}' == 2).map(
  PARSE 'li > a' ATTR='href' LABEL='gallery'
  FETCH '${testEnv.mockHost}{{ value }}' LABEL='post'
).branch(
  (
    PARSE '#tags > li' LABEL='tag'
  ),
  (
    PARSE 'img' ATTR='src'
    FETCH '${testEnv.mockHost}{{ value }}' READ=false WRITE=true LABEL='image'
  )
)
`
const instructionsMerging = `
().loop(
  FETCH '${testEnv.mockHost}/gallery/page/{{"+" index 1}}.html' LABEL='gallery-get'
).until('{{ index }}' == 2)
.branch(
  (
    PARSE 'img' ATTR='src'
  ),
  (
    PARSE 'li > a' ATTR='href' LABEL='gallery'
    FETCH '${testEnv.mockHost}{{ value }}' LABEL='post'
    PARSE 'img' ATTR='src'
  )
).branch(
  (
    FETCH '${testEnv.mockHost}{{ value }}' READ=false WRITE=true LABEL='image'
  )
)
`
const instructionsWithEmptyValue = `
().loop(
  FETCH '${testEnv.mockHost}/gallery/page/{{"+" index 1}}.html' LABEL='gallery-get'
).until('{{ index }}' == 2).map(
  PARSE 'li > a' ATTR='href' LABEL='gallery'
  FETCH '${testEnv.mockHost}{{ value }}' LABEL='post'
).branch(
  (
    PARSE '#tags > li' LABEL='tag'
  ),
  (
    PARSE 'img' ATTR='src' LABEL='image-parse'
    FETCH '${testEnv.mockHost}{{ value }}' READ=false WRITE=true LABEL='image'
    PARSE 'nothing' LABEL='never-reached'
  )
)
`
const options = {}

describe(__filename, () => {
  beforeEach(testEnv.beforeEach)
  afterEach(testEnv.afterEach)

  it('should be able to init a scraper twice', async () => {
    const scraper = new ScraperProgram(instructions, testEnv.outputFolder, options)
    scraper.start(testEnv.outputFolder)
    await scraper.toPromise()

    await scraper.start(testEnv.outputFolder)
    scraper.stop()
    await scraper.toPromise()

    const scraper2 = new ScraperProgram(instructions, testEnv.outputFolder, options)
    const result = scraper2.query(['tag'])
  })
  it('should run an instruction set', async function(...args: any[]) {
    const scraper = new ScraperProgram(instructions, testEnv.outputFolder, options)
    scraper.start(testEnv.outputFolder)
    await scraper.toPromise()
    const result = scraper.query(['image', 'tag'], {
      groupBy: 'post'
    })
    // prettier-ignore
    assertQueryResultPartial(result, [
      {
        image: [
          { requestParams: '{"url":"http://looping/image/the.jpg","headers":{},"method":"GET"}' }
        ],
        tag: [
          { value: 'one' },
          { value: 'two' }
        ]
      },
      {
        image: [
          { requestParams: '{"url":"http://looping/image/quick.jpg","headers":{},"method":"GET"}' }
        ],
        tag: [
          { value: 'one' },
          { value: 'two' }
        ]
      },
      {
        image: [
          { requestParams: '{"url":"http://looping/image/brown.jpg","headers":{},"method":"GET"}' }
        ],
        tag: [
          { value: 'four' },
          { value: 'five' }
        ]
      },
      {
        image: [
          { requestParams: '{"url":"http://looping/image/fox.jpg","headers":{},"method":"GET"}' }
        ],
        tag: [
          { value: 'three' },
          { value: 'four' },
          { value: 'five' }
        ]
      }
    ])
  })
  describe('query ordering', () => {
    it.skip('should order a merging instruction as well', async function() {
      const scraper = new ScraperProgram(instructionsMerging, testEnv.outputFolder, options)
      scraper.start(testEnv.outputFolder)
      await scraper.toPromise()
      const result = scraper.query(['image'])
      assertQueryResultPartial(result, [
        {
          // prettier-ignore
          image: [
            { requestParams: '{"url":"http://looping/image/gal-1.jpg","headers":{},"method":"GET"}' },
            { requestParams: '{"url":"http://looping/image/the.jpg","headers":{},"method":"GET"}' },
            { requestParams: '{"url":"http://looping/image/quick.jpg","headers":{},"method":"GET"}' },
            { requestParams: '{"url":"http://looping/image/gal-2.jpg","headers":{},"method":"GET"}' },
            { requestParams: '{"url":"http://looping/image/brown.jpg","headers":{},"method":"GET"}' },
            { requestParams: '{"url":"http://looping/image/fox.jpg","headers":{},"method":"GET"}' }
          ]
        }
      ])
    })
    it('should work with image, image-page, tag,', async () => {
      const scraper = new ScraperProgram(instructionsWithEmptyValue, testEnv.outputFolder, options)
      scraper.start(testEnv.outputFolder)
      await scraper.toPromise()
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
    it('should handle nonexistent labels', async function() {
      const scraper = new ScraperProgram(instructionsWithEmptyValue, testEnv.outputFolder, options)
      scraper.start(testEnv.outputFolder)
      await scraper.toPromise()
      // commands that dont exist never get a field
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
      return

      assertQueryResultPartial(scraper.query(['nonexistent'], { groupBy: 'post' }), [
        {},
        {},
        {},
        {}
      ])
    })
    it('should work with commands with no values', async function() {
      const scraper = new ScraperProgram(instructionsWithEmptyValue, testEnv.outputFolder, options)
      scraper.start(testEnv.outputFolder)
      await scraper.toPromise()
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
