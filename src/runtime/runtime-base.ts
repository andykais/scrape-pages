const RuntimeState = {
  IDLE: 'IDLE' as const,
  INITIALIZING: 'INITIALIZING' as const,
  ACTIVE: 'ACTIVE' as const,
  STOPPING: 'STOPPING' as const,
  COMPLETED: 'COMPLETED' as const,
  ERRORED: 'ERRORED' as const,
}

type RuntimeState = keyof typeof RuntimeState
class RuntimeBase {
  public state: RuntimeState

  public constructor(public name: string) {
    this.state = RuntimeState.IDLE
  }

  public start = async (passedArg?: any) => {
    const prevState = this.state
    if (this.state !== RuntimeState.STOPPING) this.setState(RuntimeState.INITIALIZING)
    try {
      const ret = this.onStart(prevState, passedArg)
      // we do this here because start for store must remain synchrnous
      if (ret instanceof Promise) await ret
      if (this.state !== RuntimeState.STOPPING) this.setState(RuntimeState.ACTIVE)
    } catch (e) {
      await this.error(e)
    }
  }

  public stop = async () => {
    try {
      const prevState = this.state
      this.setState(RuntimeState.STOPPING)
      await this.onStop(prevState)
    } catch (e) {
      await this.error(e)
    }
  }

  public error = async (error: Error) => {
    const prevState = this.state
    this.setState(RuntimeState.ERRORED)
    // we dont know how to handle errors thrown by the error handler, so they are UnhandledRejections
    await this.onError(prevState, error)
  }

  public complete = async () => {
    const prevState = this.state
    try {
      await this.onComplete(prevState)
      this.setState(RuntimeState.COMPLETED)
    } catch (e) {
      await this.error(e)
    }
  }

  protected requireState(allowedStates: RuntimeState[]) {
    if (!allowedStates.includes(this.state)) {
      throw new Error(
        `${this.name} state must be ${allowedStates.join(' or ')} to call this method. It is ${
          this.state
        }`
      )
    }
  }

  // overridable classes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async onStop(prevState: RuntimeState) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onStart(prevState: RuntimeState, arg?: any): Promise<void> | void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async onComplete(prevState: RuntimeState) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async onError(prevState: RuntimeState, error: Error) {
    // by default we bubble up errors
    throw error
  }

  // private methods
  private setState(newState: RuntimeState) {
    this.state = newState
  }
}

export {
  RuntimeBase,
  // type exports
  RuntimeState,
}
