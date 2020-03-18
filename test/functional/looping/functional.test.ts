// import { HttpFolderMock } from '@test/setup'
import { FunctionalTestSetup } from '@test/functional/setup'

import { ScraperProgram } from '@scrape-pages'

const TEST_NAME = 'looping'
const testEnv = new FunctionalTestSetup(TEST_NAME, __dirname)

// if you want the loop to happen per each input, put it in a branch!
const instructions = `
().loop(
  FETCH '${testEnv.mockHost}/gallery/page/{{"+" index 1}}.html' LABEL='gallery'
).until('{{ index }}' == 1)
`
const options = {}

describe(__filename, () => {
  beforeEach(testEnv.beforeEachCommon)
  afterEach(testEnv.afterEachCommon)

  it('should run an instruction set', async () => {
    const scraper = new ScraperProgram(instructions, testEnv.outputFolder, options)
    scraper.start(testEnv.outputFolder)
    await scraper.toPromise()
    const result = scraper.query(['gallery'])
    console.log(result)
  })
})
