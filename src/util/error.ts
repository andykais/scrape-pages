import * as Fetch from 'node-fetch'

/**
 * This boi wraps any error and disguises itself as that error
 */
class ContextualError extends Error {
  /** this will get overriden by the passed error */
  public name = 'ContextualError'

  private origin: Error

  constructor(contextualMessage: string, error: Error) {
    super(`${contextualMessage}: ${error.message}`)
    Object.defineProperty(this, 'origin', {
      enumerable: false,
      value: error
    })

    const thisStack = this.stack ? this.stack.split('\n', 2).join('\n') : ''
    const originStack = this.origin.stack
    // instantiate the stack first (its a weird lazy val)
    this.stack = `${thisStack}
    from:
${originStack}`

    // then set the name to the original error. It helps when filtering errors
    Object.defineProperty(this, 'name', {
      enumerable: false,
      value: error.name
    })
  }
}

class InternalError extends Error {
  constructor(message: string) {
    super(message)
  }
}

class ResponseError extends Error {
  public name = 'ResponseError'
  public constructor(response: Fetch.Response, url: string) {
    super(`Request "${url}" failed. Received status ${response.status}`)
  }
}

/**
 * @name ExpectedException
 * @description used in places that we want a short circuit without cancelling the whole program
 */
class ExpectedException extends Error {
  public name = 'ExpectedException'
  public constructor(public e: Error, public commandId: number) {
    super('A short circuit was issued')
  }
}

// class ExpectedCancellation extends Error {
//   public name = 'ExpectedCancellationError'
//   public cause: string
//   public constructor(e: Error) {
//     super('Short circuit since stop() was called.')
//     this.cause = e.toString()
//   }
// }

export { ContextualError, InternalError, ResponseError, ExpectedException }
