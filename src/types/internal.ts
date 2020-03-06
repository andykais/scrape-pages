import * as Rx from 'rxjs'
import { Instructions } from './instructions'
import { Options } from './options'
import Immutable from 'seamless-immutable'

interface Settings {
  instructions: Instructions
  options: Options
}

interface Tools {}

type Value = string
// TODO find out if we are passing ids around. I think we still are
interface StoredValue {
  value: string
  id: number
}

namespace Stream {
  export interface Data {
    id: number
    value: string
    index: number
    inputs: { [slug: string]: string }
  }
  export type Payload = Immutable.ImmutableObject<Data>
  export type Operation = Rx.UnaryFunction<
    Rx.Observable<Payload>,
    Rx.Observable<Payload>
  >
}

// type RxOperation = Rx.UnaryFunction<StoredValue, StoredValue>

export { Settings, Tools, Stream }
