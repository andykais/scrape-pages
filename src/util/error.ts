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

export { ContextualError, InternalError }
