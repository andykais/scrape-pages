import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import Immutable from 'seamless-immutable'
import * as RxCustom from './observables'
import * as commands from '@scrape-pages/runtime/commands'
import * as tools from '@scrape-pages/runtime/tools'
import { InternalError } from '@scrape-pages/util/error'
// type imports
import { Program, Operation, Command, Expression } from '@scrape-pages/types/instructions'
import * as I from '@scrape-pages/types/instructions'
import { Options } from '@scrape-pages/types/options'
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'

class Compiler {
  private initialPayload: Stream.Payload
  public tools: Tools
  public commands: commands.BaseCommand[]
  public program: Stream.Observable

  public constructor(private settings: Settings) {
    this.initialPayload = Immutable({
      value: '',
      index: 0,
      id: -1,
      inputs: this.settings.options.inputs || {}
    })
  }

  private compileExpression(expression: Expression) {}

  private instantiateCommand = (command: Command) => {
    const instantiatedCommand = (() => {
      switch (command.command) {
        case 'HTTP':
          return new commands.HttpCommand(this.settings, this.tools, command)
        case 'PARSE':
          return new commands.ParseCommand(this.settings, this.tools, command)
        // TODO REGEX, TAG
        default:
          throw new InternalError(`unknown command ${command.command}`)
      }
    })()

    this.commands.push(instantiatedCommand)
    return instantiatedCommand
  }

  private mapCommands(operation: { commands: I.Command[] }): Stream.Operation {
    const commands: Stream.Operation[] = operation.commands
      .map(this.instantiateCommand)
      .map(command => ops.flatMap(command.stream)) // TODO reset payload index to zero?
    return Rx.pipe.apply(Rx, commands)
  }

  private compileLoopOperation(operation: { commands: I.Command[] }): Stream.Operation {
    const commandsOperation = this.mapCommands(operation)

    // prettier-ignore
    return ops.flatMap((payload: Stream.Payload) => RxCustom.loop(
      commandsOperation,
      index => payload.set('index', index)
    ))
  }

  // compile operations
  private compileBranchOperation(operation: I.BranchOperation): Stream.Operation {
    const programs = operation.programs.map(this.compileFlow)
    return ops.flatMap(payload => Rx.merge(...programs.map(op => Rx.of(payload).pipe(op))))
  }

  // compile program
  private compileFlow(program: Program): Stream.Operation {
    const operations: Stream.Operation[] = program.map(operation => {
      switch (operation.operator) {
        case 'init':
          return this.mapCommands(operation)
        case 'map':
          return this.mapCommands(operation)
        case 'loop':
          return this.compileLoopOperation(operation)
        case 'branch':
          return this.compileBranchOperation(operation)
        default:
          throw new InternalError(`unknown operation '${operation.operator}'`)
      }
    })
    return Rx.pipe.apply(Rx, operations)
  }

  public compile() {
    const rxjsOperator = this.compileFlow(this.settings.instructions.program)
    this.program = Rx.of(this.initialPayload).pipe(rxjsOperator)
    // this.tools = {
    //   store: new tools.Store()
    // }

    return {
      // tools: this.tools,
      program: this.program,
      commands: this.commands
    }
  }
}

export { Compiler }
