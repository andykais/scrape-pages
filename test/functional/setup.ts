import * as path from 'path'
import { rmrf } from '@scrape-pages/util/fs'
import { HttpFolderMock } from './nock-host-folder'

const RUN_OUTPUT_FOLDER = path.resolve(__dirname, '.run-output')
class FunctionalTestSetup {
  public outputFolder: string
  public mockUrl: string
  public siteMock: HttpFolderMock
  constructor(testName: string, testDirname: string) {
    this.outputFolder = path.resolve(RUN_OUTPUT_FOLDER, testDirname)
    this.mockUrl = `http://${testName}`
    const mockFolder = `${testDirname}/fixtures`
    // TODO we dont have a good way to add the pseudo-random behavior here
    this.siteMock = new HttpFolderMock(this.mockUrl, mockFolder)
  }

  async beforeEachCommon() {
    await rmrf(this.outputFolder)
    await this.siteMock.init()
  }

  afterEachCommon() {
    this.siteMock.done()
  }
}

export { FunctionalTestSetup }
