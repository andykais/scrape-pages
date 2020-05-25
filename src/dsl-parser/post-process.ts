import * as commandClasses from '@scrape-pages/runtime/commands'
import { BaseCommand } from '@scrape-pages/runtime/commands/base-command'
import * as i from '@scrape-pages/types/instructions'
import { TypeUtils } from '@scrape-pages/types/internal'

/**
 * Lots of any types in the post processors yikes!
 * Its not worth the effort to build the "in between" types here
 *
 * The post processors are a bit odd because they are the glue between the dsl (which only cares about syntax) and the Instructions which care a lot about content
 */

interface DslCommand {
  command: i.Command['command'] | 'INPUT'
  args: string
  kwargs: { [keywordArg: string]: any }
}

function processRawCommandArgs(args: string[], rawCommand: DslCommand): i.Command {
  if (args.length !== rawCommand.args.length) {
    const argStrs = args.map((a) => `<${a}>`).join(' ')
    // prettier-ignore
    throw new Error(`${rawCommand.command} received incorrect number of positional args. Expected ${rawCommand.command} ${argStrs}`)
  }
  return {
    command: rawCommand.command,
    params: {
      ...args.reduce((acc, argName, i) => ({ ...acc, [argName]: rawCommand.args[i] }), {}),
      ...rawCommand.kwargs,
    },
  } as i.Command
}
function postProcessCommands(commands: any[]) {
  return commands.map((rawCommand: DslCommand) => {
    switch (rawCommand.command) {
      case 'FETCH':
        return processRawCommandArgs(['URL'], rawCommand)
      case 'PARSE':
        return processRawCommandArgs(['SELECTOR'], rawCommand)
      case 'REPLACE':
        return processRawCommandArgs(['SELECTOR'], rawCommand)
      case 'SET':
        return processRawCommandArgs(['VAR_NAME'], rawCommand)
      default:
        throw new Error(`Unknown command '${rawCommand.command}' in the program`)
    }
  })
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
      case 'merge':
        operation.programs = postProcessPrograms(operation.programs)
        return operation
      default:
        throw new Error(`Unknown operator '${operation.operator}'`)
    }
  })
}

function postProcessPreProgram(preProgram: DslCommand[]) {
  const inputs = []
  for (const rawCommand of preProgram) {
    switch (rawCommand.command) {
      case 'INPUT':
        inputs.push(rawCommand.args[0])
        break
      default:
        throw new Error(`Uknown command '${rawCommand.command}' in the pre program.`)
    }
  }

  return { inputs }
}

function postProcess(result: any) {
  const preProgram = postProcessPreProgram(result.preProgram)
  const program = postProcessProgram(result.program)

  return {
    ...preProgram,
    program,
  }
}

export { postProcess }
