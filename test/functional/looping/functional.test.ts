// import { HttpFolderMock } from '@test/setup'
import { FunctionalTestSetup } from '@test/functional/setup'

import { ScraperProgram } from '@scrape-pages'
import { queryExecutionDebugger } from '@test/query-debugger'

const TEST_NAME = 'looping'
const testEnv = new FunctionalTestSetup(TEST_NAME, __dirname)

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
    const result = scraper.query(['image', 'tag', 'post'], {
      inspector: queryExecutionDebugger(
        ['label', 'currentCommandLabel', 'requestParams', 'value', 'recurseDepth'],
        this
      )
    })
    // console.log(result)
    // const { inspect } = require('util')
    // console.log(inspect(result, { depth: null, colors: true }))
  })
})
