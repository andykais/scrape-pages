import * as Fetch from 'node-fetch'

class ResponseError extends Error {
  public name = 'ResponseError'
  public constructor(response: Fetch.Response, url: string) {
    super(`Request "${url}" failed. Received status ${response.status}`)
  }
}

export { FetchError } from 'node-fetch'
export { TypeGuardError } from 'typescript-is'
export { ResponseError }
