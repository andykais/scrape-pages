import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
// type imports
import * as i from 'scrape-pages/types/instructions'
import { RxOperation, StoredValue } from 'scrape-pages/types/internal'
import { Compiler } from './'

function dummyDbWrite(value: string): StoredValue {
  return {
    value,
    id: -1
  }
}

// lets write a few of these to find out what can be abstracted

function getInitOperator(compiler: Compiler, operation: i.InitOperation): RxOperation {
  const commands: RxOperation[] = operation.commands.map(compiler.instantiateCommand).map(command =>
    Rx.pipe(
      ops.flatMap(command.stream),
      ops.map(dummyDbWrite)
      // .map(compiler.tools.store.saveValueToDatabase)
    )
  )

  return Rx.pipe.apply(Rx, commands)
}

const getMapOperator =  getInitOperator

function loop(operation: RxOperation, storedValue: StoredValue) {
  // include while loop index
  return ops.expand(() => Rx.of(storedValue).pipe(operation))
}
function getLoopOperator(compiler: Compiler, operation: i.InitOperation): RxOperation {
  return ops.map(x => x)
}

export { getInitOperator }
