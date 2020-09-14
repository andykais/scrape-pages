import * as path from 'path'
import '@test/setup'
import { rmrf } from '@scrape-pages/util/fs'
import { HttpFolderMock } from './nock-host-folder'
import { queryExecutionDebugger } from '@test/query-debugger'
// type imports
import { HttpMockOptions } from './nock-host-folder'
import { ScraperProgram } from '@scrape-pages'
import { Options } from '@scrape-pages/types/options'

const RUN_OUTPUT_FOLDER = path.resolve(__dirname, '.run-output')
class FunctionalTestSetup {
  public outputFolder: string
  public mockHost: string
  private mockFolder: string
  public siteMock: HttpFolderMock
  public beforeEach: () => Promise<void>
  private mochaContext: Mocha.Context
  private previousTestWasStep: boolean
  public scrapers: Array<ScraperProgram>

  public constructor(
    testDirectory: string,
    private options: { initNock: boolean } = { initNock: true }
  ) {
    const testDirname = path.basename(testDirectory)
    this.outputFolder = path.resolve(RUN_OUTPUT_FOLDER, testDirname)
    this.mockHost = `http://${testDirname}`
    this.mockFolder = `${testDirectory}/fixtures`
    this.beforeEach = FunctionalTestSetup.beforeEachInternal(this)
    this.previousTestWasStep = false
    this.scrapers = []
  }

  // curried so that we can pick up the mocha context but also reference our own `this`
  public static beforeEachInternal = (testEnv: FunctionalTestSetup) => {
    return async function () {
      testEnv.mochaContext = this.currentTest
      const isStep = testEnv.mochaContext.body.includes('markRemainingTestsAndSubSuitesAsPending')
      await rmrf(testEnv.outputFolder)
      testEnv.siteMock = new HttpFolderMock(testEnv.mockFolder, testEnv.mockHost)
      if (testEnv.options.initNock) await testEnv.siteMock.init()
      testEnv.previousTestWasStep = isStep
    }
  }

  public afterEach = () => {
    for (const scraper of this.scrapers) {
      if ((scraper as any).runtime.tools.store.database.open) {
        ;(scraper as any).runtime.tools.store.database.close()
      }
    }
    this.scrapers = []
    this.siteMock.done()
  }

  public async restartHttpMock(options?: HttpMockOptions) {
    this.siteMock.done()
    this.siteMock = new HttpFolderMock(this.mockHost, this.mockFolder, options)
    await this.siteMock.init()
  }

  public get queryDebugger() {
    this.mochaContext.timeout(0)
    return queryExecutionDebugger
  }

  public addScraper(instructionsArg: string, folder: string, options?: Options) {
    const newSize = this.scrapers.push(new ScraperProgram(instructionsArg, folder, options))
    return this.scrapers[newSize - 1]
  }
}

export { assertQueryResultPartial } from './assertions'
export { FunctionalTestSetup }
