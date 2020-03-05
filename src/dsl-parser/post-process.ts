import * as i from '../types/instructions'

/**
 * Lots of any types in the post processors yikes!
 * Its not worth the effort to build the "in between" types here
 *
 * The post processors are a bit odd because they are the glue between the dsl (which only cares about syntax) and the Instructions which care a lot about content
 */

interface DslCommand {
  command: string
  arg: string
  kwargs: { [keywordArg: string]: any }
}
function processRawCommandAndRenameArg(renameArgAs: string, rawCommand: DslCommand) {
  return {
    command: rawCommand.command,
    params: { ...rawCommand.kwargs, [renameArgAs]: rawCommand.arg }
  }
}

function postProcessCommands(commands: any[]) {
  return commands.map((rawCommand: DslCommand) => {
    switch (rawCommand.command) {
      case 'HTTP':
        return processRawCommandAndRenameArg('URL', rawCommand)
      case 'PARSE':
        return processRawCommandAndRenameArg('SELECTOR', rawCommand)
      case 'TAG':
        return processRawCommandAndRenameArg('SLUG', rawCommand)
      case 'REGEX':
        return processRawCommandAndRenameArg('REPLACE', rawCommand)
      default:
        throw new Error(`Unknown command '${rawCommand.command}'`)
    }
  })
  return commands
}
function postProcessExpression(expression: i.Expression) {
  return expression
}
function postProcessPrograms(programs: i.Program[]): i.Program[] {
  return programs.map(postProcessProgram)
}
function postProcessProgram(program: i.Program): any {
  return program.map((operation: any) => {
    switch (operation.operator) {
      case 'init':
        operation.commands = postProcessCommands(operation.commands)
        return operation
      case 'map':
        operation.commands = postProcessCommands(operation.commands)
        return operation
      case 'catch':
        operation.commands = postProcessCommands(operation.commands)
        return operation
      case 'loop':
        operation.commands = postProcessCommands(operation.commands)
        return operation
      case 'reduce':
        operation.commands = postProcessCommands(operation.commands)
        return operation
      case 'until':
        operation.expression = postProcessExpression(operation.expression)
        return operation
      case 'branch':
        operation.programs = postProcessPrograms(operation.programs)
        return operation
      default:
        throw new Error(`Unknown operator '${operation.operator}'`)
    }
  })
}

function postProcess(result: any) {
  const inputs = (result.preProgram as DslCommand[])
    .filter(command => command.command === 'INPUT')
    .map(command => command.arg)
  const program = postProcessProgram(result.program)

  return {
    inputs,
    program
  }
}

export { postProcess }
