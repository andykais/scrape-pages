import * as path from 'path'
import * as fs from '@scrape-pages/util/fs'
import nock from 'nock'

class RequestStats {
  public routes: { [route: string]: number } = {}
  public totalRoutes = 0
  public totalRoutesUsed = () => Object.values(this.routes).filter(v => v > 0).length
  public allRoutesUsed = () => this.totalRoutesUsed() === this.totalRoutes

  public addRoute(route: string) {
    this.totalRoutes++
    this.routes[route] = 0
  }
  public useRoute(route: string) {
    this.routes[route]++
  }
  public resetCount() {
    for (const route of Object.keys(this.routes)) {
      this.routes[route] = 0
    }
  }
}

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
  public requestStats: RequestStats

  public constructor(
    private mockEndpointsFolder: string,
    private baseUrl: string,
    private options: HttpMockOptions = {}
  ) {}

  public init = async () => {
    const scope = nock(this.baseUrl)
    const random = this.options.randomSeed && new SeedPsuedoRandom(this.options.randomSeed)
    const delay = this.options.delay || 0
    this.requestStats = new RequestStats()

    const files = await fs.findFiles(this.mockEndpointsFolder)

    this.interceptors = files.map(file => {
      const relativePath = path.relative(this.mockEndpointsFolder, file)
      const fullPath = path.resolve(this.mockEndpointsFolder, file)
      const route = `/${relativePath}`
      this.requestStats.addRoute(route)
      const interceptor = scope.get(route)
      const randomMultiplier = random ? random.nextFloat() : 1
      interceptor.delay(randomMultiplier * delay).replyWithFile(200, fullPath)
      return interceptor
    })
    scope.on('request', req => {
      if (this.debug) {
        /* eslint-disable-next-line no-console */
        console.log(req.method, req.path)
      }
      this.requestStats.useRoute(req.path)
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
    nock.cleanAll()
  }

  public setDebug = (on: boolean) => (this.debug = on)
}

export {
  HttpFolderMock,
  // type exports
  HttpMockOptions
}
