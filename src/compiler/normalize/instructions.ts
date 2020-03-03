import {
  Instructions,
  Program,
  Operation,
  Command,
  Expression
} from 'scrape-pages/types/instructions'

const DEFAULTS = {
  operations: {
    init: {}
  }
}

function normalizeExpression(expressionInit: Expression) {
  return expressionInit
}
function normalizeCommands(commandInit: Command) {}
function normalizeOperation(operationInit: Operation) {
  switch (operationInit.operator) {
    case 'init':
      return
  }
}

// function normalizeCommandOperation()

function normalizeProgram(programInit: Program) {}
function normalize(instructionsInit: Instructions) {
  console.log('hi')
}

class Encoder {
  // onCommand(command: Command) {}
  // onOperation(operation: Operation) {}
}

type DecodedExpressionOperation<ExpressionOutput> = {
  operator: string
  expression: ExpressionOutput
}
type DecodedCommandsOperation<CommandOutput> = { operator: string; commands: CommandOutput[] }
type DecodedProgramOperation<ProgramOutput> = { operator: string; programs: ProgramOutput[] }

type DecodedOperation<ProgramOutput, CommandOutput, ExpressionOutput> =
  | DecodedExpressionOperation<ExpressionOutput>
  | DecodedCommandsOperation<CommandOutput>
  | DecodedProgramOperation<ProgramOutput>

interface EncoderInterface<
  InstructionsOutput,
  ProgramOutput,
  OperationOutput,
  CommandOutput,
  ExpressionOutput
> {
  // "primitives" are Command and Expression
  onExpression(expression: Expression): ExpressionOutput
  onCommand(command: Command): CommandOutput
  onOperation(
    operation: DecodedOperation<ProgramOutput, CommandOutput, ExpressionOutput>
  ): OperationOutput
}
type ExpressionOutput = string
type CommandOutput = Command
type OperationOutput = Operation
type ProgramOutput = Program
type InstructionOutput = Instructions
type DefaultsEncoderInterface = EncoderInterface<
  InstructionOutput,
  ProgramOutput,
  OperationOutput,
  CommandOutput,
  ExpressionOutput
>
class DefaultsDecoder extends Encoder implements DefaultsEncoderInterface {
  onExpression(expression: Expression) {
    return expression
  }
  onCommand(command: Command) {
    return command
  }
  onOperation(operation: OperationOutput) {
    return operation
  }
  // onCommand(command: Command) {}
  // onOperation(operation: Operation) {}
  // onCommandsOperation(operator: string, commands: Command[]) {}
  // onExpressionOperation(operator: string, expression: Expression) {}
  // onProgramOperation(operator: string, programs: Program[]) {}
  // onProgram() {}
}

export { normalize }
