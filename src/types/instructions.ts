type Slug = string
type Expression = string
type Template = string

interface FetchCommand {
  command: 'FETCH'
  /** @internal */
  databaseId?: number
  params: {
    LABEL?: string
    METHOD?: 'GET' | 'PUT' | 'POST' | 'DELETE'
    URL: Template
    HEADERS?: { [headerName: string]: Template }
    BODY?: any
    READ?: boolean
    WRITE?: boolean
    CACHE?: boolean
    PRIORITY?: number
  }
}

interface ParseCommand {
  command: 'PARSE'
  /** @internal */
  databaseId?: number
  params: {
    LABEL?: string
    SELECTOR: string
    FORMAT?: 'html' | 'xml' | 'json'
    ATTR?: string
    MAX?: number
  }
}

interface TextReplaceCommand {
  command: 'REPLACE'
  /** @internal */
  databaseId?: number
  params: {
    LABEL?: string
    SELECTOR: string
    WITH?: string
    FLAGS?: string
  }
}

interface SetVarCommand {
  command: 'SET'
  /** @internal */
  databaseId?: number
  params: {
    LABEL?: string
    VAR_NAME: string
  }
}

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
  FetchCommand,
  ParseCommand,
  TextReplaceCommand,
  SetVarCommand,
}
