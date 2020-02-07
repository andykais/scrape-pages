import * as Fetch from 'node-fetch'

class ActiveScraperLockError extends Error {
  public name = 'ActiveScraperLockError'
  public constructor() {
    super(
      `Another scraper is actively running or a scraper has not exited in this folder properly. You should not run two scrapers simultaneously, though you can use params.forceStart to do so.`
    )
  }
}

class MismatchedVersionError extends Error {
  public name = 'MismatchedVersionError'
  public constructor(oldVersion: string, newVersion: string = 'undefined') {
    super(
      `This folder was created by an older version of scrape-pages! Old: ${oldVersion}, New: ${newVersion}. Consider adding the param 'cleanFolder: true' and starting fresh.`
    )
  }
}

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
export {
  ActiveScraperLockError,
  MismatchedVersionError,
  ResponseError,
  UninitializedDatabaseError,
  InternalLibraryError
}
