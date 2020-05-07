const INITIALIZED = Symbol('INITIALIZED')

class RuntimeBase {
  public [INITIALIZED] = false
  public constructor(public name: string) {}
  public async initialize(): Promise<void> {
    this[INITIALIZED] = true
  }
  public isInitialized = () => this[INITIALIZED]
  public mustBeInitialized() {
    if (!this[INITIALIZED])
      throw new Error(`${this.name} must be initialized before calling this method.`)
  }
  public cleanup(...args: any[]): void {}
}

export { RuntimeBase }

import { EventEmitter } from 'events'
const RuntimeState = {
  IDLE: 'IDLE' as const,
  INITIALIZING: 'INITIALIZING' as const,
  ACTIVE: 'ACTIVE' as const,
  STOPPING: 'STOPPING' as const,
  COMPLETED: 'COMPLETED' as const,
  ERRORED: 'ERRORED' as const
}

type RuntimeState = keyof typeof RuntimeState
class RuntimeBase_v2 {
  public constructor(private emitter: EventEmitter) {}
  public state: RuntimeState

  private setState(newState: RuntimeState) {}

  public start() {
    const prevState = this.state
    this.setState(RuntimeState.INITIALIZING)
    this.onStart(prevState)
      .then(() => this.setState(RuntimeState.ACTIVE))
      .catch(e => this.emitter.emit('error', e))
  }

  public stop() {
    const prevState = this.state
    this.setState(RuntimeState.STOPPING)
    this.onStop(prevState).catch(e => this.emitter.emit('error', e))
  }

  public error(error: Error) {
    const prevState = this.state
    this.setState(RuntimeState.ERRORED)
    this.onError(prevState, error).catch(e => this.emitter.emit('error', e))
  }

  public complete() {
    const prevState = this.state
    this.onComplete(prevState)
      .then(() => this.setState(RuntimeState.COMPLETED))
      .catch(e => this.emitter.emit('error', e))
  }

  // overridable classes
  protected async onStop(prevState: RuntimeState) {}
  protected async onStart(prevState: RuntimeState) {}
  protected async onComplete(prevState: RuntimeState) {}
  protected async onError(prevState: RuntimeState, error: Error) {}
}

export {
  RuntimeBase_v2,
  // type exports
  RuntimeState
}
