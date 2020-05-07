import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import Immutable from 'seamless-immutable'
import * as commands from '@scrape-pages/runtime/commands'
import * as tools from '@scrape-pages/runtime/tools'
import * as RxCustom from './observables'
import { BooleanExpressionEvaluator } from './expression-evaluator'
import { InternalError } from '@scrape-pages/util/error'
// type imports
import { Program, Operation, Command, Expression } from '@scrape-pages/types/instructions'
import * as I from '@scrape-pages/types/instructions'
import { Options } from '@scrape-pages/types/options'
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'

class Compiler {
  private initialPayload: Stream.Payload
  private commandIdCounter: number
  public commands: commands.AnyCommand[]
  public program: Stream.Observable

  public constructor(private settings: Settings, private tools: Tools) {
    this.initialPayload = Immutable({
      value: '',
      operatorIndex: 0,
      valueIndex: 0,
      id: -1,
      inputs: this.settings.options.inputs || {}
    })
    this.commands = []
    this.commandIdCounter = 0
  }

  private compileExpression(expression: Expression) {}

  private instantiateCommand = (command: Command) => {
    // OK this is super hacky. We know that this is a sqlite database with an auto incrementing counter.
    // We also know that we have synchronous database writes, so we can trust that in order really means in order.
    // Therefore, it is ok to assume that the ids will be in order of traversal, since we initialize commands
    // in the same order that we walk over them (see this.commands.push below)
    // its not very future forward thinking, since we might have a remote scraper in the future, and we dont
    // need to compile any commands for it.
    command.databaseId = ++this.commandIdCounter

    const instantiatedCommand = (() => {
      switch (command.command) {
        case 'FETCH':
          return new commands.FetchCommand(this.settings, this.tools, command)
        case 'PARSE':
          return new commands.ParseCommand(this.settings, this.tools, command)
        case 'REPLACE':
          return new commands.ReplaceCommand(this.settings, this.tools, command)
      }
    })()

    this.commands.push(instantiatedCommand)
    return instantiatedCommand
  }

  private static catchExpectedErrors(e: Error) {
    if (e.name === 'ExpectedException') return Rx.EMPTY
    else throw e
  }

  private mapCommands(operation: { commands: I.Command[] }): Stream.Operation {
    const commands: Stream.Operation[] = operation.commands
      .map(this.instantiateCommand)
      .map(command =>
        Rx.pipe(ops.flatMap(command.callStream), ops.catchError(Compiler.catchExpectedErrors))
      )
    return Rx.pipe.apply(Rx, commands)
  }

  // a note that the operationIndex gets passed down to whatever command consumes it
  // Not a problem, but worth calling out
  private compileLoopOperation(operation: { commands: I.Command[] }): Stream.Operation {
    const commandsOperation = this.mapCommands(operation)

    // prettier-ignore
    return ops.flatMap((payload: Stream.Payload) => RxCustom.loop(
      commandsOperation,
      index => payload.set('operatorIndex', index)
    ))
  }

  // compile operations
  private compileMergeOperation(operation: I.MergeOperation): Stream.Operation {
    const programs = operation.programs.map(this.compileFlow)
    return ops.flatMap(payload => Rx.merge(...programs.map(op => Rx.of(payload).pipe(op))))
  }

  private compileReduceOperation(operation: I.ReduceOperation): Stream.Operation {
    const commandsOperation = this.mapCommands(operation)

    return ops.flatMap(parentPayload =>
      Rx.of(parentPayload).pipe(
        ops.expand((payload, i) => {
          const flattendPayload = payload.merge({ id: parentPayload.id, operatorIndex: i + 1 })
          return Rx.of(flattendPayload).pipe(commandsOperation)
        }),
        // design decision. We are not passing the input out of the function before it goes through reduce.
        // we could, so long as we have knowledge of parent commands and how many steps are inside the reduce.
        // the reason we arent including it is because if you _dont_ want that behavior, you cannot code around it currently.
        ops.filter((_, i) => i !== 0)
      )
    )
    // return ops.expand(payload => Rx.of(payload).pipe(commandsOperation))
  }

  private compileUntilOperation(operation: I.UntilOperation): Stream.Operation {
    const evaluator = new BooleanExpressionEvaluator(operation.expression)
    return ops.takeWhile(payload => !evaluator.eval(payload))
  }

  // compile program
  private compileFlow = (program: Program): Stream.Operation => {
    const operations: Stream.Operation[] = program.map(operation => {
      switch (operation.operator) {
        case 'init':
          return this.mapCommands(operation)
        case 'map':
          return this.mapCommands(operation)
        case 'loop':
          return this.compileLoopOperation(operation)
        case 'merge':
          return this.compileMergeOperation(operation)
        case 'reduce':
          return this.compileReduceOperation(operation)
        case 'until':
          return this.compileUntilOperation(operation)
        default:
          throw new InternalError(`unknown operation '${operation.operator}'`)
      }
    })

    return Rx.pipe.apply(Rx, operations)
  }

  public compile() {
    const rxjsOperator = this.compileFlow(this.settings.instructions.program)
    this.program = Rx.of(this.initialPayload).pipe(rxjsOperator)

    return {
      program: this.program,
      commands: this.commands
    }
  }
}

export { Compiler }
