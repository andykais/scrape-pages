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

  public constructor(private apiEmitter: EventEmitter) {
    super('EmitEvents')
    this.onAnyListeners = []
  }

  public emit(event: string, data?: any) {
    // send to onAnys if applicable
    for (const listener of this.onAnyListeners) {
      listener(event, data)
    }
    this.apiEmitter.emit(event, data)
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
    return this.apiEmitter.listenerCount(`${command}:progress`) > 0
  }

  public commandSucceeded(command: CommandNames, info: CommandInfo) {
    this.emit(`${command}:saved`, info)
  }

  public initialized() {
    this.emit('initialized')
  }
}

export { Notify }
