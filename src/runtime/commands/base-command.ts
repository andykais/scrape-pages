import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { RuntimeBase } from '@scrape-pages/runtime/runtime-base'
// type imports
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'
import * as I from '@scrape-pages/types/instructions'

abstract class BaseCommand extends RuntimeBase {
  constructor(private settings: Settings, private tools: Tools, private command: I.Command) {
    super('Command')
    super.name = this.constructor.name
  }

  abstract stream(payload: Stream.Payload): string[]

  callStream(payload: Stream.Payload) {
    const values = this.stream(payload)

    // TODO this is good, lets build the store first
    // type ValueWithId = { value: string; id: number }
    // const valuesWithIds: ValueWithId[] = this.tools.store.qs.insertValuesBatch(payload, values)
    // Rx.from(valuesWithIds).pipe(ops.map(valueWithId => payload.merge(valueWithId)))

    return Rx.of(payload)
  }
}

export { BaseCommand }
