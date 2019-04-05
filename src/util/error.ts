import * as Fetch from 'node-fetch'

export const typescriptIsWrapper = (fn: (encoded: any) => void) => (encoded: any) => {
  try {
    fn(encoded)
  } catch (e) {
    throw new RuntimeTypeError(e.message)
  }
}

class ResponseError extends Error {
  public name = 'ResponseError'
  public constructor(response: Fetch.Response, url: string) {
    super(`Request "${url}" failed. Received status ${response.status}`)
  }
}

class RuntimeTypeError extends TypeError {
  public name = 'RuntimeTypeError'
  public constructor(typescriptIsMsg: string) {
    super(typescriptIsMsg)
  }
}

export { ResponseError, RuntimeTypeError }
