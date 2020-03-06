// import { HttpFolderMock } from '@test/setup'
import { FunctionalTestSetup } from '@test/functional/setup'

import { ScraperProgram } from '@scrape-pages'

const TEST_NAME = 'looping'
const testEnv = new FunctionalTestSetup(TEST_NAME, __dirname)

const instructions = `
().loop(
   GET 'https://${testEnv.mockUrl}/pages/{{index}}'
 )`
const options = {}

describe(__filename, () => {
  beforeEach(testEnv.beforeEachCommon)
  afterEach(testEnv.afterEachCommon)

  it('should run an instruction set', () => {
    const scraper = new ScraperProgram(instructions, options)
    scraper.start(testEnv.outputFolder)
  })
})
