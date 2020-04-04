type Slug = string
type Expression = string
type Template = string

// const instructions = `
// (
//   HTTP 'http://gallery/page/{{'+' 1 indeex}}.html' LABEL='gallery'
//   PARSE 'li > a' ATTR='href'
//   HTTP 'http://gallery{{ value }}'
// ).branch(
//   (
//     PARSE '#tags > li' LABEL='tag'
//   ),
//   (
//     PARSE 'img' ATTR='src'
//     HTTP 'http://gallery{{ value }}' READ=false WRITE=true LABEL='image'
//   )
// )
// `

// const instructionsJson = `
// (
//   FETCH 'http://json-parsing/api-response.json'
//   PARSE 'posts[type="post"].content' FORMAT='json'
//   REPLACE '\n$' WITH=''
// )
// `

// const instructionsRecurse = `
// (
//   FETCH 'http://recurse-next/index.html'
// ).recurse(
//   PARSE '#batch-id'
//   FETCH 'http://recurse-next/batch-id-page/id-{{ value }}.html'
// ).branch(
//   (
//     PARSE 'li > a' ATTR='href'
//   ),
//   (
//     FETCH 'http://recurse-next{{ value }}'
//   ).branch(
//     (
//       PARSE '#tags > li'
//     ),
//     (
//       PARSE 'img' ATTR='src'
//       FETCH 'http://recurse-next{{ value }}' READ=false WRITE=false
//     )
//   )
// )
// `

interface FetchCommand {
  command: 'FETCH'
  /** @internal */
  databaseId?: number
  params: {
    LABEL?: string
    METHOD?: 'GET' | 'PUT' | 'POST' | 'DELETE'
    URL: Template
    HEADERS?: { [headerName: string]: Template }
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
  }
}

type Command = FetchCommand | ParseCommand | TextReplaceCommand

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
// TODO rename this to merge (its closer to what it is)
interface BranchOperation {
  operator: 'branch'
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
  | BranchOperation

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
  InitOperation,
  UntilOperation,
  MapOperation,
  ReduceOperation,
  LoopOperation,
  CatchOperation,
  BranchOperation,
  FetchCommand,
  ParseCommand,
  TextReplaceCommand
}
