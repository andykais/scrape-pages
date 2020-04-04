import * as path from 'path'
import { rmrf } from '@scrape-pages/util/fs'
import { HttpFolderMock } from './nock-host-folder'
// type imports
import { HttpMockOptions } from './nock-host-folder'

const RUN_OUTPUT_FOLDER = path.resolve(__dirname, '.run-output')
class FunctionalTestSetup {
  public outputFolder: string
  public mockHost: string
  private mockFolder: string
  public siteMock: HttpFolderMock
  constructor(testDirname: string) {
    this.outputFolder = path.resolve(RUN_OUTPUT_FOLDER, testDirname)
    this.mockHost = `http://${path.basename(testDirname)}`
    this.mockFolder = `${testDirname}/fixtures`
  }

  beforeEach = async () => {
    await rmrf(this.outputFolder)
    this.siteMock = new HttpFolderMock(this.mockFolder, this.mockHost)
    await this.siteMock.init()
  }

  afterEach = () => {
    this.siteMock.done()
  }

  async restartHttpMock(options?: HttpMockOptions) {
    this.siteMock.done()
    this.siteMock = new HttpFolderMock(this.mockHost, this.mockFolder, options)
    await this.siteMock.init()
  }
}

export { assertQueryResultPartial } from './assertions'
export { FunctionalTestSetup }
