import * as path from 'path'
import { findFiles } from '../src/util/fs'
import nock from 'nock'

class SeedPsuedoRandom {
  private _seed: number
  public constructor(seed: number) {
    this._seed = seed % 2147483647
    if (this._seed <= 0) this._seed += 2147483646
  }
  public next = () => (this._seed = (this._seed * 16807) % 2147483647)
  public nextFloat = () => (this.next() - 1) / 2147483646
}

type Options = {
  randomSeed?: number
  delay?: number
}
class NockFolderMock {
  private mockEndpointsFolder: string
  private baseUrl: string
  private options: Options
  private interceptors?: nock.Interceptor[]

  public constructor(mockEndpointsFolder: string, baseUrl: string, options: Options = {}) {
    Object.assign(this, { mockEndpointsFolder, baseUrl, options })
  }

  public static create = async (
    mockEndpointsFolder: string,
    baseUrl: string,
    options: Options = {}
  ) => {
    const siteMock = new NockFolderMock(mockEndpointsFolder, baseUrl, options)
    await siteMock.init()
    return siteMock
  }

  public init = async () => {
    const scope = nock(this.baseUrl)
    const random = this.options.randomSeed && new SeedPsuedoRandom(this.options.randomSeed)
    const delay = this.options.delay || 0

    const files = await findFiles(this.mockEndpointsFolder)

    this.interceptors = files.map(file => {
      const relativePath = path.relative(this.mockEndpointsFolder, file)
      const fullPath = path.resolve(this.mockEndpointsFolder, file)
      const interceptor = scope.get(`/${relativePath}`)
      const randomMultiplier = random ? random.nextFloat() : 1
      interceptor.delay(randomMultiplier * delay).replyWithFile(200, fullPath)
      return interceptor
    })
  }

  public done = () => {
    if (this.interceptors) this.interceptors.forEach(nock.removeInterceptor)
    else throw new Error('Must init() endpoints before calling done()')
  }
}
export { NockFolderMock }
