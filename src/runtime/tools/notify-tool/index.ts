import { RuntimeBase } from '@scrape-pages/runtime/runtime-base'
// type imports
import { EventEmitter } from 'events'
import * as I from '@scrape-pages/types/instructions'
import { Stream } from '@scrape-pages/types/internal'

type CommandNames = I.Command['command']

type CommandInfo = { id: Stream.Id; LABEL: I.Command['params']['LABEL'] }

type OnAnyListener = (event: string, data: any) => void
class Notify extends RuntimeBase {
  private onAnyListeners: OnAnyListener[]

  public constructor(private emitter: EventEmitter) {
    super('EmitEvents')
    this.onAnyListeners = []
  }

  public emit(event: string, data?: any) {
    // send to onAnys if applicable
    for (const listener of this.onAnyListeners) {
      listener(event, data)
    }
    this.emitter.emit(event, data)
  }

  public registerOnAny(listener: (event: string, data: any) => void) {
    this.onAnyListeners.push(listener)
  }

  public asyncCommandQueued(command: CommandNames, info: CommandInfo) {
    this.emit(`${command}:queued`, info)
  }
  public asyncCommandProgress(
    command: CommandNames,
    info: CommandInfo & { progress: number; metadata: {} }
  ) {
    this.emit(`${command}:progress`, info)
  }
  public hasProgressListeners(command: CommandNames) {
    return this.emitter.listenerCount(`${command}:progress`) > 0
  }

  public commandSucceeded(command: CommandNames, info: CommandInfo) {
    this.emit(`${command}:saved`, info)
  }

  public initialized() {
    this.emit('initialized')
  }
  public done() {
    this.emit('done')
  }
  public error(error: Error) {
    this.emit('error', error)
  }

  /* RuntimeBase overrides */
  public async initialize() {}
  public async cleanup() {
    this.onAnyListeners = [] // TODO is this a memory leak? Should I delete the functions?
    this.emitter.removeAllListeners()
  }
}

export { Notify }
