import * as Rx from 'rxjs'
import Immutable from 'seamless-immutable'
import BetterSqlite3 from 'better-sqlite3'
import * as tools from '@scrape-pages/runtime/tools'
import { Instructions } from './instructions'
import { Options } from './options'
import {
  SelectedRow as OrderedValuesRow,
  SelectedRowWithDebug as OrderedValuesRowWithDebug
} from '@scrape-pages/runtime/tools/store-tool/queries/select-ordered-labeled-values'

interface Settings {
  instructions: Instructions
  folder: string
  options: Options
}

type Tools = {
  store: tools.Store
  queue: tools.Queue
  notify: tools.Notify
}

namespace Models {
  export namespace NetworkRequest {
    export type Status = 'QUEUED' | 'COMPLETE' | 'FAILED'
  }
}

namespace TypeUtils {
  export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never
  export type OptionalKeys<T> = { [k in keyof T]-?: undefined extends T[k] ? k : never }[keyof T]
}

namespace Sqlite3 {
  export type Database = BetterSqlite3.Database
  export type Statement = BetterSqlite3.Statement
}

namespace Querier {
  export type DebuggerInspector = (rows: QueryResultWithDebug) => void

  export type Labels = string[]
  // IF so desired, multi-level grouping could be accomplished. Though its hard to know if that adds value
  export type QueryApiOptions = { groupBy?: string; inspector?: DebuggerInspector }

  type QueryResultRow = Omit<OrderedValuesRow, 'commandId'>
  export type OrderedValuesGroup = { [scraperName: string]: OrderedValuesRow[] }
  export type QueryResult = OrderedValuesGroup[]
  export type QueryResultWithDebug = OrderedValuesRowWithDebug[]
  /**
   * scraper querying interface.
   */
  export interface Interface {
    prepare: (labels: Labels, options?: QueryApiOptions) => () => QueryResult
    (labels: Labels, options?: QueryApiOptions): QueryResult
  }
}

namespace Stream {
  export type Id = number
  export type DownloadInfo = { bytes: number; filename: string | null }
  export interface Data {
    id: number
    value: string
    operatorIndex: number
    valueIndex: number
    inputs: { [slug: string]: string }
  }
  export type Payload = Immutable.ImmutableObject<Data>
  export type Operation = Rx.UnaryFunction<Rx.Observable<Payload>, Rx.Observable<Payload>>
  export type Observable = Rx.Observable<Payload>
  export type Subscriber = Rx.Subscription
}

export { Settings, Tools, Models, Querier, Stream, TypeUtils, Sqlite3 }
