import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { RuntimeBase } from '@scrape-pages/runtime/runtime-base'
// type imports
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'
import * as I from '@scrape-pages/types/instructions'

abstract class BaseCommand extends RuntimeBase {
  protected LABEL: string

  constructor(protected settings: Settings, protected tools: Tools, protected command: I.Command) {
    super('Command')
    super.name = this.constructor.name
    if (this.command.params.LABEL) this.LABEL = this.command.params.LABEL
    else this.LABEL = 'placeholder' // TODO randomly generate a non-clashing string label
  }

  abstract async stream(payload: Stream.Payload): Promise<string[]>

  callStream = (payload: Stream.Payload) => {
    const values = this.stream(payload)

    // TODO this is good, lets build the store first
    // type ValueWithId = { value: string; id: number }
    // const valuesWithIds: ValueWithId[] = this.tools.store.qs.insertValuesBatch(payload, values, this.command.params.LABEL)
    // Rx.from(valuesWithIds).pipe(ops.map(valueWithId => payload.merge(valueWithId)))

    return Rx.of(payload)
  }
}

export { BaseCommand }
