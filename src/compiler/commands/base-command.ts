import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'

abstract class BaseCommand {
  constructor(private settings: Settings, private tools: Tools) {}

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
