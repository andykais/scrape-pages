import * as Fetch from 'node-fetch'

class ResponseError extends Error {
  public name = 'ResponseError'
  public constructor(response: Fetch.Response, url: string) {
    super(`Request "${url}" failed. Received status ${response.status}`)
  }
}

class UninitializedDatabaseError extends Error {
  public name = 'UninitializedDatabaseError'
  public constructor(databaseFile: string) {
    super(
      `Database does not exist at ${databaseFile}. You must start the scraper before querying from the database!`
    )
  }
}

class InternalLibraryError extends Error {
  public name = 'InternalLibraryError'
  public constructor(message: string) {
    super(message)
  }
}

export { FetchError } from 'node-fetch'
export { TypeGuardError } from 'typescript-is'
export { ResponseError, UninitializedDatabaseError, InternalLibraryError }
