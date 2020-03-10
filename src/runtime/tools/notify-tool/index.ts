import { RuntimeBase } from '@scrape-pages/runtime/runtime-base'
// type imports
import { EventEmitter } from 'events'
import * as I from '@scrape-pages/types/instructions'
import { Stream } from '@scrape-pages/types/internal'

type CommandNames = I.Command['command']

class Notify extends RuntimeBase {
  public constructor(private emitter: EventEmitter) {
    super('EmitEvents')
  }

  public emit(event: string, data: any) {
    // send to onAnys if applicable
    this.emitter.emit(event, data)
  }

  public registerOnAny(listener: (event: string, data: any) => void) {}

  public commandQueued(command: CommandNames, id: Stream.Id) {
    this.emitter.emit(`${command}:queued`, { id })
  }
  public commandProgress(command: CommandNames, id: Stream.Id, progress: number) {
    this.emitter.emit(`${command}:progress`, { id, progress })
  }
  public commandSucceeded(
    command: CommandNames,
    info: { id: Stream.Id; filename: string; mimeType: string; byteLength: number }
  ) {
    this.emitter.emit(`${command}:saved`, info)
  }

  public initialized() {
    this.emitter.emit('initialized')
  }
  public done() {
    this.emitter.emit('done')
  }
  public error(error: Error) {
    this.emitter.emit('error', error)
  }

  /* RuntimeBase overrides */
  public async initialize() {}
  public async cleanup() {}
}

export { Notify }
