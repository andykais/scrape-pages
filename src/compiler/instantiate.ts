import { Program, Operation, Command, Expression } from 'scrape-pages/types/instructions'
import { Options } from 'scrape-pages/types/options'
import { Settings, Tools } from 'scrape-pages/types/internal'

class Compiler {
  constructor(private settings: Settings, private tools: Tools) {}

  compileExpression(expression: Expression) {}
  instantiateCommand(command: Command) {}
  instantiateProgram(program: Program) {}

  compile() {
    return this.instantiateProgram(this.settings.instructions.program)
  }
}
