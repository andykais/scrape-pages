type Slug = string
type Expression = string
type Template = string

interface RawCommand<T extends string, Params extends {}> {
  command: T
  /** @internal */
  databaseId?: number
  params: {
    /** Identifies a command so that it can be queried for later. */
    LABEL?: string
  } & Params
}

interface FetchParams {
  /** HTTP method */
  METHOD?: 'GET' | 'PUT' | 'POST' | 'DELETE'
  /** Templated url */
  URL: Template
  /** Templated http headers */
  HEADERS?: { [headerName: string]: Template }
  /** Templated http body */
  BODY?: any
  /** Read the response body into the \{\{ value \}\} variable */
  READ?: boolean
  /** Write the response body to disk */
  WRITE?: boolean
  /**
   * Cache this request.
   * A cached request will not make a network call, but will read the response from the  database
   */
  CACHE?: boolean
  /**
   * The priority this request will take in the rate limited queue.
   * Note if rate limiting is disabled this has no effect.
   * Higher number = higher priority.
   */
  PRIORITY?: number
}
/**
 * Fetch Command
 *
 * http requests that can use values inside templates
 *
 */
type FetchCommand = RawCommand<'FETCH', FetchParams>
// TODO on the site, make these look like this (we still need to special case the positional args like URL):
//
// Fetch Command
//
// http requests that can use values inside templates
//
// Usage: FETCH URL [OPTIONS]
//
// OPTIONS:
//    METHOD        HTTP method
//    HEADERS       Templated http headers
//    BODY          Templated http body
//    READ          Read the response body into the \{\{ value \}\} variable
//    WRITE         Write the response body to disk
//    CACHE         Cache this request.
//                  A cached request will not make a network call, but will read the response from the  database
//    PRIORITY      The priority this request will take in the rate limited queue.
//                  Note if rate limiting is disabled this has no effect.
//                  Higher number = higher priority.

interface ParseParams {
  LABEL?: string
  SELECTOR: string
  FORMAT?: 'html' | 'xml' | 'json' | 'delimiter'
  ATTR?: string
  TRIM?: boolean // trim any remaining whitespace
  MAX?: number
}
type ParseCommand = RawCommand<'PARSE', ParseParams>

interface TextReplaceParams {
  LABEL?: string
  SELECTOR: string
  WITH?: string
  FLAGS?: string
}
type TextReplaceCommand = RawCommand<'REPLACE', TextReplaceParams>

interface SetVarParams {
  LABEL?: string
  VAR_NAME: string
}
type SetVarCommand = RawCommand<'SET', SetVarParams>

type Command = FetchCommand | ParseCommand | TextReplaceCommand | SetVarCommand

interface InitOperation {
  operator: 'init'
  commands: Command[]
}
interface UntilOperation {
  operator: 'until'
  expression: Expression
}
interface MapOperation {
  operator: 'map'
  commands: Command[]
}
interface ReduceOperation {
  operator: 'reduce'
  commands: Command[]
}
interface LoopOperation {
  operator: 'loop'
  commands: Command[]
}
interface CatchOperation {
  operator: 'catch'
  commands: Command[]
}
interface MergeOperation {
  operator: 'merge'
  programs: Program[]
}

// TODO add leaf operation
// interface LeafOperation {
//   commands: Command[]
// }

type Operation =
  | InitOperation
  | UntilOperation
  | MapOperation
  | ReduceOperation
  | LoopOperation
  | CatchOperation
  | MergeOperation

type Program = Operation[]

interface Instructions {
  inputs: Slug[]
  program: Program
}

export {
  Instructions,
  Program,
  Operation,
  Command,
  Expression,
  Slug,
  Template,
  InitOperation,
  UntilOperation,
  MapOperation,
  ReduceOperation,
  LoopOperation,
  CatchOperation,
  MergeOperation,
  FetchParams,
  ParseParams,
  TextReplaceParams,
  SetVarParams,
  RawCommand,
  FetchCommand,
  ParseCommand,
  TextReplaceCommand,
  SetVarCommand,
}
