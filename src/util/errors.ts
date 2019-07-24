import * as Fetch from 'node-fetch'

/**
 * Error returned when a unexpected response is returned from a request.
 * This error can be supressed by allowing failures on your scraper.
 *
 * @public
 */
class ResponseError extends Error {
  public name = 'ResponseError'
  public constructor(response: Fetch.Response, url: string) {
    super(`Request "${url}" failed. Received status ${response.status}`)
  }
}

/**
 * Error when attempting to query a folder before starting the scraper.
 * E.g. calling `query()` before calling `start()`.
 *
 * @public
 */
class UninitializedDatabaseError extends Error {
  public name = 'UninitializedDatabaseError'
  public constructor(databaseFile: string) {
    super(
      `Database does not exist at ${databaseFile}. You must start the scraper before querying from the database!`
    )
  }
}

export { FetchError } from 'node-fetch'
export { TypeGuardError } from 'typescript-is'
export { ResponseError, UninitializedDatabaseError }
