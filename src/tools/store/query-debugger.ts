import * as readlineSync from 'readline-sync'
import { selectOrderedScrapers } from './queries'
// type imports
import {
  SelectedRow as OrderedScrapersRow,
  SelectedRowWithDebugInfo as OrderedScrapersRowWithDebug
} from './queries/select-ordered-scrapers'

export type DebuggerView = (keyof OrderedScrapersRowWithDebug)[]
const queryExecutionDebugger = (
  scrapers: string[],
  sqlCompiler: ReturnType<typeof selectOrderedScrapers>,
  debuggerView: DebuggerView
) => {
  // we are cheating with the type here because function overloading in typescript doesnt play nicely with higher order functions
  const preparedStatment = sqlCompiler(Array.from(new Set(scrapers)), true)
  const resultAsDebug = (preparedStatment() as any) as OrderedScrapersRowWithDebug[]

  readlineSync.question(
    'This is an internal debugging method. It will hault execution until there is input. Press [enter] to continue.',
    { mask: '' }
  )

  const resultAsDepthMap: Map<number, OrderedScrapersRow[]> = resultAsDebug.reduce((acc, row) => {
    acc
      .set(row.recurseDepth, acc.get(row.recurseDepth) || [])
      .get(row.recurseDepth)!
      .push(row)
    return acc
  }, new Map())
  const resultSplitByDepth = Array.from(resultAsDepthMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(entry => entry[1])

  let key = ''
  let index = 0
  while (key !== 'q' && index < resultSplitByDepth.length) {
    const resultAtDepth = resultSplitByDepth[index]
    const viewable = resultAtDepth.map(row =>
      // TODO move this to util/object.ts (filterObjectKeys)?
      debuggerView.reduce((acc: { [column: string]: any }, column) => {
        acc[column] = (row as any)[column]
        return acc
      }, {})
    )
    console.clear() // eslint-disable-line no-console
    console.table(viewable) // eslint-disable-line no-console
    key = readlineSync.keyIn(
      'Press [s] to move forward, press [w] to move backward, press [q] to exit the debugger',
      { limit: 'swq' }
    )

    if (key === 's' && index < resultSplitByDepth.length - 1) index++
    else if (key === 'w' && index > 0) index--
  }
}

export { queryExecutionDebugger }
