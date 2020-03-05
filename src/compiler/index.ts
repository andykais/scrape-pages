import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import * as instructionOps from './operations'
import * as commands from './commands'
// type imports
import { Program, Operation, Command, Expression } from 'scrape-pages/types/instructions'
import { Options } from 'scrape-pages/types/options'
import { Settings, Tools } from 'scrape-pages/types/internal'

class Compiler {
  constructor(private settings: Settings, private tools: Tools) {}

  compileExpression(expression: Expression) {}
  instantiateCommand(command: Command) {
    return new commands.HttpCommand(this.settings, this.tools)
  }
  compileFlow(program: Program) {
    const operations = program.map(operation => {
      switch(operation.operator) {
        case 'init':
          return instructionOps.getInitOperator(this, operation)
      }
    })
    return Rx.pipe()
  }

  compile() {
    return this.compileFlow(this.settings.instructions.program)
  }
}

export { Compiler }
