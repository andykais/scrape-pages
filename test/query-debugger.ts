import * as readlineSync from 'readline-sync'
// type imports
import { ScraperProgram } from '@scrape-pages'
import { Tools, Querier } from '@scrape-pages/types/internal'

type RowWithDebug = Querier.QueryResultWithDebug[0]
type DebuggerView = (keyof RowWithDebug)[]
class QueryDebugger {
  public constructor(private view: DebuggerView) {}
}

const queryExecutionDebugger = (view: DebuggerView) => (rows: Querier.QueryResultWithDebug) => {
  readlineSync.question(
    'This is an internal debugging method. It will hault execution until there is input. Press [enter] to continue.',
    { mask: '' }
  )

  const depthMap: Map<number, RowWithDebug[]> = rows.reduce((acc, row) => {
    acc
      .set(row.recurseDepth, acc.get(row.recurseDepth) || [])
      .get(row.recurseDepth)!
      .push(row)
    return acc
  }, new Map())

  const groupedDepthArray = Array.from(depthMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(entry => entry[1])

  let key = ''
  let index = 0
  while (key !== 'q' && index < groupedDepthArray.length) {
    const resultAtDepth = groupedDepthArray[index]
    const viewable = resultAtDepth.map(row =>
      view.reduce((acc: { [column: string]: any }, column) => {
        acc[column] = row[column]
        return acc
      }, {})
    )
    console.clear() // eslint-disable-line no-console
    console.table(viewable) // eslint-disable-line no-console
    key = readlineSync.keyIn(
      'Press [s] to move forward, press [w] to move backward, press [q] to exit the debugger',
      { limit: 'swq' }
    )

    if (key === 's' && index < groupedDepthArray.length - 1) index++
    else if (key === 'w' && index > 0) index--
  }
}

export { queryExecutionDebugger }
