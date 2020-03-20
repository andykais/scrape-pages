// import { HttpFolderMock } from '@test/setup'
import { FunctionalTestSetup } from '@test/functional/setup'

import { ScraperProgram } from '@scrape-pages'

const TEST_NAME = 'looping'
const testEnv = new FunctionalTestSetup(TEST_NAME, __dirname)

// if you want the loop to happen per each input, put it in a branch!
// it might be difficult to say "loop 5 times and ignore request failures"
const instructions = `
().loop(
  FETCH '${testEnv.mockHost}/gallery/page/{{"+" index 1}}.html'
  PARSE 'li > a' ATTR='href' LABEL='gallery'
).until('{{ index }}' == 1).map(
  FETCH '${testEnv.mockHost}{{ value }}'
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
  beforeEach(testEnv.beforeEachCommon)
  afterEach(testEnv.afterEachCommon)

  it('should run an instruction set', async () => {
    const scraper = new ScraperProgram(instructions, testEnv.outputFolder, options)
    scraper.start(testEnv.outputFolder)
    await scraper.toPromise()
    const result = scraper.query(['tag', 'image'], { groupBy: 'gallery' })
    const { inspect } = require('util')
    console.log(inspect(result, { depth: null, colors: true }))
  })
})
