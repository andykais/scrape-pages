import * as Fetch from 'node-fetch'

/**
 * This boi wraps any error and disguises itself as that error
 */
class ContextualError extends Error {
  /** this will get overriden by the passed error */
  public name = 'ContextualError'

  private origin: Error

  public constructor(contextualMessage: string, error: Error) {
    super(`${contextualMessage}: ${error.message}`)
    Object.defineProperty(this, 'origin', {
      enumerable: false,
      value: error,
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
      value: error.name,
    })
  }
}

class InternalError extends Error {
  public constructor(message: string) {
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
 * Used in places that we want a short circuit without cancelling the whole program
 *
 * @internal
 */
class ExpectedException extends Error {
  public name = 'ExpectedException'
  public constructor(public e: Error, public commandId: number) {
    super('A short circuit was issued')
  }
}

export { ContextualError, InternalError, ResponseError, ExpectedException }
