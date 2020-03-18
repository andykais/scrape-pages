import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { RuntimeBase } from '@scrape-pages/runtime/runtime-base'
// type imports
import { TypeUtils, Settings, Tools, Stream } from '@scrape-pages/types/internal'
import * as I from '@scrape-pages/types/instructions'

type OrUndefined<T> = { [K in keyof T]: T[K] | undefined }
type RequiredField<T> = OrUndefined<Required<T>>
type ParamDefaultsGeneric<T> = Omit<RequiredField<Pick<T, TypeUtils.OptionalKeys<T>>>, 'LABEL'>

type Merge<A extends object, B extends object> = { [K in keyof A & keyof B]: A[K] | B[K] }

abstract class BaseCommand<
  Command extends I.Command,
  ParamDefaults extends ParamDefaultsGeneric<I.Command['params']>
> extends RuntimeBase {
  protected commandId: Stream.Id
  protected params: Merge<Required<Command['params']>, ParamDefaults & { LABEL: undefined }>

  constructor(
    protected settings: Settings,
    protected tools: Tools,
    protected command: Command,
    // defaultParams is a wider type than ParamDefaults because we cannot trust ParamDefaults to enforce the proper types
    defaultParams: ParamDefaultsGeneric<Command['params']>
  ) {
    super('Command')
    super.name = this.constructor.name
    this.params = { LABEL: undefined, ...defaultParams, ...(this.command.params as any) }
  }

  // were pushing the responsibility of db writes up here because fetch is very different than parse & regex
  // fetch is different specifically because we need the id before we have a value to save the file in a non-clashing name ${id}.${ext}
  abstract async stream(payload: Stream.Payload): Promise<Stream.Payload[]>

  callStream = (payload: Stream.Payload): Stream.Observable => {
    const values = this.stream(payload)

    // TODO this is good, lets build the store first
    // type ValueWithId = { value: string; id: number }
    // const valuesWithIds: ValueWithId[] = this.tools.store.qs.insertValuesBatch(payload, values, this.command.params.LABEL)
    // Rx.from(valuesWithIds).pipe(ops.map(valueWithId => payload.merge(valueWithId)))

    return Rx.from(values).pipe(ops.flatMap(promise => promise))
  }

  async initialize() {
    this.commandId = this.tools.store.qs.insertCommand(this.command.params.LABEL)
    super.initialize()
  }
}

type AnyCommand = BaseCommand<I.Command, I.Command['params']>

export {
  BaseCommand,
  // type exports
  AnyCommand
}
