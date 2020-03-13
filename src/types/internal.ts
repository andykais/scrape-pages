import * as Rx from 'rxjs'
import Immutable from 'seamless-immutable'
import Sqlite3 from 'better-sqlite3'
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
  notify: tools.Notify
}

type Database = Sqlite3.Database

namespace Stream {
  export type Id = number
  export type DownloadInfo = { bytes: number; filename: string | null }
  export interface Data {
    id: number
    value: string
    index: number
    inputs: { [slug: string]: string }
  }
  export type Payload = Immutable.ImmutableObject<Data>
  export type Operation = Rx.UnaryFunction<Rx.Observable<Payload>, Rx.Observable<Payload>>
  export type Observable = Rx.Observable<Payload>
  export type Subscriber = Rx.Subscription
}

export { Settings, Tools, Stream, Database }
