type Slug = string
type Expression = string

interface HttpCommand {
  command: 'HTTP'
  params: {
    METHOD?: 'GET' | 'PUT' | 'POST' | 'DELETE'
    URL: string
    READ?: boolean
    WRITE?: boolean
    CACHE?: boolean
    PRIORITY?: boolean
  }
}

interface ParseCommand {
  command: 'PARSE'
  params: {
    SELECTOR: string
    ATTR?: string
    MAX?: number
  }
}

interface TagCommand {
  command: 'TAG'
  params: {
    SLUG: string
  }
}

type Command = HttpCommand | ParseCommand | TagCommand

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

type Operation = InitOperation | UntilOperation | MapOperation | BranchOperation
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
  HttpCommand, // TODO rename HttpCommand
  ParseCommand,
  TagCommand,
  // TODO RegexCommand
}
