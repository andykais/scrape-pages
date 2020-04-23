import { expect } from 'chai'
import { FunctionalTestSetup, assertQueryResultPartial } from '@test/functional/setup'
import { queryExecutionDebugger } from '@test/query-debugger'

import { ScraperProgram } from '@scrape-pages'
import * as instructions from './instructions'

const testEnv = new FunctionalTestSetup(__dirname)

describe(__filename, () => {
  beforeEach(testEnv.beforeEach)
  afterEach(testEnv.afterEach)

  describe('query ordering', () => {
    describe('with simple instructions', () => {
      it(`query(['image', 'tag'], {groupBy: 'post'})`, async () => {
        const scraper = new ScraperProgram(instructions.simple, testEnv.outputFolder)
        await scraper.start()
        await scraper.toPromise()
        const result = scraper.query(['image', 'tag'], {
          groupBy: 'post',
          // inspector: testEnv.queryDebugger([
          //   // 'value',
          //   // 'requestParams',
          //   'commandId',
          //   'parentTreeId',
          //   'label',
          //   'currentCommandLabel',
          //   'recurseDepth'
          // ])
        })
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
      it(`query(['image', 'tag'], {groupBy: 'post'})`, async () => {
        const scraper = new ScraperProgram(instructions.merging, testEnv.outputFolder)
        await scraper.start()
        await scraper.toPromise()
        const result = scraper.query(['image', 'tag'], {
          groupBy: 'post',
          // inspector: testEnv.queryDebugger([
          //   // 'value',
          //   // 'requestParams',
          //   'commandId',
          //   'parentTreeId',
          //   'label',
          //   'currentCommandLabel',
          //   'recurseDepth'
          // ])
        })
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
    describe('with reused labels instructions', () => {
      it(`query(['image'])`, async () => {
        console.log(instructions.reuseLabels)
        const scraper = new ScraperProgram(instructions.reuseLabels, testEnv.outputFolder)
        await scraper.start()
        await scraper.toPromise()
        const result = scraper.query(['image'], {
          // inspector: testEnv.queryDebugger([
          //   // 'value',
          //   'requestParams',
          //   'commandId',
          //   'currentCommandId',
          //   // 'label',
          //   'currentCommandLabel',
          //   'recurseDepth',
          //   'commandSort'
          // ])
        })
        // console.log(result[0])
        assertQueryResultPartial(result, [
          {
            // prettier-ignore
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
        const scraper = new ScraperProgram(instructions.reuseLabels, testEnv.outputFolder)
        await scraper.start()
        await scraper.toPromise()
        const result = scraper.query(['image', 'tag'], {
          groupBy: 'post'
          // inspector: testEnv.queryDebugger([
          //   'value',
          //   'label',
          //   'currentCommandLabel',
          //   'recurseDepth'
          // ])
        })

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
    // // prettier-ignore
    // const imageTagGroupByPost = [
    //   {
    //     image: [{ requestParams: '{"url":"http://looping/image/the.jpg","headers":{},"method":"GET"}' }],
    //     tag: [{ value: 'one' }, { value: 'two' }]
    //   },
    //   {
    //     image: [{ requestParams: '{"url":"http://looping/image/quick.jpg","headers":{},"method":"GET"}' }],
    //     tag: [{ value: 'one' }, { value: 'two' }]
    //   },
    //   {
    //     image: [{ requestParams: '{"url":"http://looping/image/brown.jpg","headers":{},"method":"GET"}' }],
    //     tag: [{ value: 'four' }, { value: 'five' }]
    //   },
    //   {
    //     image: [{ requestParams: '{"url":"http://looping/image/fox.jpg","headers":{},"method":"GET"}' }],
    //     tag: [{ value: 'three' }, { value: 'four' }, { value: 'five' }]
    //   }
    // ]
    // const testables = [
    //   {
    //     name: 'simple',
    //     instructions: instructions.simple
    //   },
    //   {
    //     name: 'merging',
    //     instructions: instructions.merging
    //   }
    //   // {
    //   //   name: 'reuse labels',
    //   //   instructions: instructions.reuseLabels
    //   // }
    // ]
    // testables.forEach(({ name, instructions }) => {
    //   describe(`with ${name} instructions`, () => {
    //     it(`query(['image', 'tag'], {groupBy: 'post'})`, async () => {
    //       const scraper = new ScraperProgram(instructions, testEnv.outputFolder)
    //       await scraper.start()
    //       await scraper.toPromise()
    //       const result = scraper.query(['image', 'tag'], {
    //         groupBy: 'post'
    //         // inspector: testEnv.queryDebugger([
    //         //   'label',
    //         //   'currentCommandLabel',
    //         //   // 'value',
    //         //   'requestParams'
    //         // ])
    //       })
    //       console.log(result)
    //       // const { inspect } = require('util')
    //       // console.log(inspect(result, { depth: null, colors: true }))
    //       // return
    //       assertQueryResultPartial(result, imageTagGroupByPost)
    //     })
    //   })
    // })
  })

  it('should be able to init a scraper twice', async () => {
    const scraper1 = new ScraperProgram(instructions.simple, testEnv.outputFolder)
    await scraper1.start()
    await scraper1.toPromise()
    const result1 = scraper1.query(['tag'])

    // await scraper1.start()
    // await scraper1.toPromise()

    const scraper2 = new ScraperProgram(instructions.simple, testEnv.outputFolder)
    const result2 = scraper2.query(['tag'])

    expect(result1).to.be.deep.equal(result2)
  })
  // step('should run and query a simple loop', async () => {
  it('should run and query a simple loop', async () => {
    const scraper = new ScraperProgram(instructions.simple, testEnv.outputFolder)
    scraper.start()
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
  it('should run an instruction set', async function(...args: any[]) {
    const scraper = new ScraperProgram(instructions.simple, testEnv.outputFolder)
    scraper.start()
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
    it('should order a merging instruction as well', async function() {
      const scraper = new ScraperProgram(instructions.merging, testEnv.outputFolder)
      scraper.start()
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
            { requestParams: '{"url":"http://looping/image/fox.jpg","headers":{},"method":"GET"}' },
          ]
        }
      ])
    })
    it('should work with image, image-page, tag,', async () => {
      const scraper = new ScraperProgram(instructions.withEmptyValue, testEnv.outputFolder)
      scraper.start()
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
      const scraper = new ScraperProgram(instructions.withEmptyValue, testEnv.outputFolder)
      scraper.start()
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
      const scraper = new ScraperProgram(instructions.withEmptyValue, testEnv.outputFolder)
      scraper.start()
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
