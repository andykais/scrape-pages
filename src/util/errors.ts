import * as Fetch from 'node-fetch'
import { VError } from 'verror'
import { inspect } from 'util'
// type imports
import * as VErrorType from 'verror'

class ActiveScraperLockError extends Error {
  public name = 'ActiveScraperLockError'
  public constructor() {
    super(
      `Another scraper is actively running. You should not run two scrapers simultaneously, though you can use params.forceRun to do so.`
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

export class ReadableError extends Error {
  _errorOriginal: Error | VErrorType
  _originalStack: string

  constructor(e: Error | VErrorType) {
    super(e.message)
    this.name = e.name
    console.log(e.message)
    this._errorOriginal = e
    // this.stack = new Error().stack || ''
  }
  [inspect.custom](depth: number, options: {}) {
    console.log('inspcet')

    return ''

  }
  get stack() {
    console.log('hello')
    // let stack = ''
    // for (const message of this.stack.split(/\n/)) {
    //   stack += message
    //   console.log({ message })
    // }

    return ''
  }

  set stack(stack) {
    this._originalStack = stack
  }

  toString() {
    console.log('me')
    return ''
  }
}
export function inspectError(e: Error | VErrorType): Error | VErrorType {
  const err = new ReadableError(e)
  // console.log(e.toString())
  return err
  // if (e instanceof VError) {
  //   const causeError = e.cause()
  //   if (causeError) return inspectError(causeError)
  //   else return e
  // } else return e
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
