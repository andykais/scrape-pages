import * as path from 'path'
import * as fs from '@scrape-pages/util/fs'
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

type HttpMockOptions = {
  randomSeed?: number
  delay?: number
}
class HttpFolderMock {
  private scope?: nock.Scope
  private interceptors?: nock.Interceptor[]
  private debug: boolean = false

  public constructor(
    private mockEndpointsFolder: string,
    private baseUrl: string,
    private options: HttpMockOptions = {}
  ) {}

  public init = async (debug: boolean = false) => {
    const scope = nock(this.baseUrl)
    const random = this.options.randomSeed && new SeedPsuedoRandom(this.options.randomSeed)
    const delay = this.options.delay || 0

    const files = await fs.findFiles(this.mockEndpointsFolder)

    this.interceptors = files.map(file => {
      const relativePath = path.relative(this.mockEndpointsFolder, file)
      const fullPath = path.resolve(this.mockEndpointsFolder, file)
      const interceptor = scope.get(`/${relativePath}`)
      const randomMultiplier = random ? random.nextFloat() : 1
      interceptor.delay(randomMultiplier * delay).replyWithFile(200, fullPath)
      return interceptor
    })
    scope.on('request', req => {
      if (this.debug) {
        console.log(req.method, req.path)
      }
    })
    this.scope = scope
  }

  public persist = () => {
    if (this.scope) this.scope.persist()
    else throw new Error('Must init() endpoints before calling persist()')
  }

  public done = () => {
    if (this.interceptors) this.interceptors.forEach(nock.removeInterceptor)
    else throw new Error('Must init() endpoints before calling done()')
  }

  public setDebug = (on: boolean) => (this.debug = on)
}

export { HttpFolderMock }
// type exports
export { HttpMockOptions }
