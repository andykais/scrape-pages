import * as Rx from 'rxjs'
import Immutable from 'seamless-immutable'
import * as tools from '@scrape-pages/runtime/tools'
import { Instructions } from './instructions'
import { Options } from './options'

interface Settings {
  instructions: Instructions
  options: Options
}

type Tools = {
  store: tools.Store
  queue: tools.Queue
}

type Value = string

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
  export type Observable = Rx.Observable<Payload>
}


export { Settings, Tools, Stream }
