type Slug = string
type Expression = string

interface RequestCommand {
  command: 'REQUEST'
  params: {
    method: 'GET' | 'PUT' | 'POST' | 'DELETE'
    url: string
    READ?: boolean
    WRITE?: boolean
    CACHE?: boolean
    PRIORITY?: boolean
  }
}

interface ParseCommand {
  command: 'PARSE'
  params: {
    selector: string
    ATTR?: string
    MAX?: number
  }
}

interface TagCommand {
  command: 'TAG'
  params: {
    slug: string
  }
}

type Command = RequestCommand | ParseCommand | TagCommand

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
interface BranchOperation {
  operator: 'branch'
  programs: Program[]
}

type Operation = InitOperation | UntilOperation | MapOperation | BranchOperation
type Program = Operation[]

interface Instructions {
  inputs: Slug[]
  program: Program
}

export { Instructions, Program, Operation, Command, Expression }
