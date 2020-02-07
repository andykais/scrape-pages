import { InternalLibraryError } from '../util/errors'
// type imports
import { Settings } from '../settings'

export abstract class ToolBase {
  public isInitialized: boolean = false

  public constructor(protected settings: Settings) {}

  public initialize() {
    this.isInitialized = true
  }

  protected throwIfUninitialized() {
    if (!this.isInitialized) {
      throw new InternalLibraryError('Attempted to use tool before it was initialized.')
    }
  }

  protected abstract cleanup(): void
}
