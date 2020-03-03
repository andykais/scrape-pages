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
    tagSlug: string
  }
}

type Commands = RequestCommand | ParseCommand | TagCommand

interface InitOperation {
  operator: 'init'
  commands: Commands[]
}
interface UntilOperation {
  operator: 'until'
  expression: Expression
}
interface MapOperation {
  operator: 'map'
  commands: Commands[]
}
interface BranchOperation {
  operator: 'branch'
  programs: Operations[][]
}

type Operations = InitOperation | UntilOperation | MapOperation | BranchOperation

interface Instructions {
  inputs: Slug[]
  program: Operations[]
}

export { Instructions }
