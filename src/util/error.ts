import * as Rx from 'rxjs'
import * as Fetch from 'node-fetch'
import VError from 'verror'

export const wrapError = (message: any) => (e: Error) =>
  Rx.throwError(new VError({ name: e.name, cause: e }, message))

class ResponseError extends Error {
  public name = 'ResponseError'
  public constructor(response: Fetch.Response, url: string) {
    super(`Request "${url}" failed. Received status ${response.status}`)
  }
}

export { ResponseError }
