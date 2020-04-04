import * as errors from '@scrape-pages/util/error'
import { Instructions } from '@scrape-pages/types/instructions'
import * as I from '@scrape-pages/types/instructions'
import { sql, Query } from './query-base'
import { SelectedRow as CommandLabelRow } from './select-commands'

function getSelectedLabelsSql(labels: string[]) {
  return labels.map(s => `'${s}'`).join(',')
}

function getSelectedCommandIdsSql(labels: string[], commands: CommandLabelRow[]) {
  return commands
    .filter(c => c.label && labels.includes(c.label))
    .map(c => c.id)
    .join(',')
}

function findFurthestDistanceTraveled(program: I.Program): number {
  let distanceTraveled = 0
  const operationsWithWrites = program.filter(p => p.operator !== 'until')
  for (const operation of operationsWithWrites) {
    switch (operation.operator) {
      case 'init':
      case 'map':
      case 'loop':
        distanceTraveled += operation.commands.length
        break
      case 'branch':
        distanceTraveled += operation.programs.reduce(
          (distance, program) => distance + findFurthestDistanceTraveled(program),
          0
        )
        break
      default:
        throw new errors.InternalError(`unknown operation '${operation.operator}'`)
    }
  }
  return distanceTraveled
}
function walkInstructions(
  instructions: Instructions,
  commandLabels: CommandLabelRow[],
  labels: string[]
) {
  function findLongestLevelTraversal(commandId: number, program: I.Program): [boolean, number] {
    let levelsTraversed = 0
    const operationsWithWrites = program.filter(p => p.operator !== 'until')
    for (let i = 0; i < operationsWithWrites.length; i++) {
      const operation = operationsWithWrites[i]

      switch (operation.operator) {
        case 'init':
        case 'map':
        case 'loop':
          const j = operation.commands.findIndex(c => c.databaseId === commandId)
          if (j === -1) levelsTraversed += operation.commands.length
          else return [true, levelsTraversed + j]
          break
        case 'branch':
          // let m = 0
          let maxDistanceDown = 0
          for (const program of operation.programs) {
            const [commandFound, n] = findLongestLevelTraversal(commandId, program)
            // if (n === -1)
            if (commandFound) return [commandFound, levelsTraversed + n]
            else maxDistanceDown = Math.max(maxDistanceDown, n)
            // otherwise Im not sure. We need to figure out branching
          }
          levelsTraversed += maxDistanceDown
          break
        default:
          throw new errors.InternalError(`unknown operation '${operation.operator}'`)
      }
    }
    return [false, levelsTraversed]
  }

  const maxLevelTraversalPerCommand = commandLabels
    .filter(c => c.label && labels.includes(c.label))
    .map(c => c.id)
    .map(id => {
      const [commandFound, maxLevelsTraversed] = findLongestLevelTraversal(id, instructions.program)
      if (!commandFound) throw new errors.InternalError(`could not find id ${id} in instructions`)
      return { id, maxLevelsTraversed }
    })

  const maxDistanceFromTop = Math.max(...maxLevelTraversalPerCommand.map(m => m.maxLevelsTraversed))
  const furthestDistanceTraveled = maxDistanceFromTop //  - 1

  const caseJoins = maxLevelTraversalPerCommand
    .filter(m => m.maxLevelsTraversed !== maxDistanceFromTop) // the deepest depth doesnt need to wait on anybody
    // .filter(m => m.maxLevelsTraversed !== maxDistanceFromTop - 1) // lowest and second lowest commands do not need to wait since they are side by side after the initial select
    .map(m => {
      const distanceToFurthestSelectedCommand = furthestDistanceTraveled - m.maxLevelsTraversed
      return `cte.commandId = ${m.id} AND cte.recurseDepth < ${distanceToFurthestSelectedCommand}`
    })
    .join(' OR ')

  const caseSorts = maxLevelTraversalPerCommand
    .filter(m => m.maxLevelsTraversed !== maxDistanceFromTop) // the deepest depth doesnt need to wait on anybody
    .map(m => {
      const distanceToFurthestSelectedCommand = furthestDistanceTraveled - m.maxLevelsTraversed
      // prettier-ignore
      return `cte.commandId = ${m.id} AND cte.recurseDepth < ${distanceToFurthestSelectedCommand}`
    })
    .join(' OR ')

  const waitingJoinsSql =
    caseJoins.length === 0
      ? 'cte.parentTreeId'
      : `CASE WHEN ${caseJoins} THEN cte.id ELSE cte.parentTreeId END`
  const waitingSortSql =
    caseSorts.length === 0 ? '0' : `CASE WHEN ${caseSorts} THEN cte.commandId ELSE 0 END`

  return {
    waitingJoinsSql,
    waitingSortSql,
    furthestDistanceTraveled
  }
}

const template = (
  labels: string[],
  instructions: Instructions,
  commandLabels: CommandLabelRow[],
  debugMode: boolean
) => {
  const ifDebugMode = (partialSql: string) => (debugMode ? partialSql : '')
  const unlessDebugMode = (partialSql: string) => (debugMode ? '' : partialSql)
  const { waitingJoinsSql, waitingSortSql, furthestDistanceTraveled } = walkInstructions(
    instructions,
    commandLabels,
    labels
  )
  const selectedCommandIdsSql = getSelectedCommandIdsSql(labels, commandLabels)

  return sql`
WITH cte as (
  SELECT
    crawlerTree.id,
    crawlerTree.value,
    crawlerTree.parentTreeId,
    crawlerTree.operatorIndex,
    crawlerTree.valueIndex,
    0 as recurseDepth,
    crawlerTree.networkRequestId,
    crawlerTree.commandId,
    crawlerTree.commandId as currentCommandId,
    0 as commandSort
    ${ifDebugMode(`
      , commands.label as currentCommandLabel
    `)}
  FROM crawlerTree
  WHERE crawlerTree.commandId in (${selectedCommandIdsSql})
  UNION ALL
  SELECT
    parentEntries.id,
    cte.value,
    parentEntries.parentTreeId,
    parentEntries.operatorIndex,
    parentEntries.valueIndex,
    cte.recurseDepth + 1,
    cte.networkRequestId,
    cte.commandId,
    parentEntries.commandId as currentCommandId,
    ${waitingSortSql} as commandSort
    ${ifDebugMode(`
      , commands.label as currentCommandLabel
    `)}
  FROM cte
  INNER JOIN crawlerTree as parentEntries
  ON ${waitingJoinsSql} = parentEntries.id
  ${ifDebugMode(`
    INNER JOIN commands ON parentEntries.commandId = commands.id
  `)}
  ORDER BY
    recurseDepth,
    valueIndex,
    operatorIndex,
    commandSort
)
SELECT
  cte.value,
  cte.commandId,
  networkRequests.filename,
  networkRequests.byteLength,
  networkRequests.status,
  networkRequests.requestParams
  ${ifDebugMode(`
  , commands.label, recurseDepth, operatorIndex, valueIndex, currentCommandLabel
  `)}
FROM cte
${ifDebugMode(`
  INNER JOIN commands ON commands.id = cte.commandId
`)}
LEFT JOIN networkRequests ON cte.networkRequestId = networkRequests.id
${unlessDebugMode(`
WHERE cte.recurseDepth = ${furthestDistanceTraveled}
`)}
`
}

type SelectedRow = {
  id: number
  value?: string
  commandId: number
  // networkCache columns
  filename: string | null
  byteLength: string | null
  status: string | null
  requestParams: string | null
}

type SelectedRowWithDebug = SelectedRow & {
  label: string
  requestId: number
  recurseDepth: number
  operatorIndex: number
  valueIndex: number
  currentCommandLabel: string
}

class SelectOrderedLabeledValues extends Query {
  constructor(database: Query['database']) {
    super(database)
    this.call = this.call.bind(this)
  }
  public call(
    instructions: Instructions,
    labels: string[],
    commandLabels: CommandLabelRow[],
    debugMode: false
  ): () => SelectedRow[]
  // prettier-ignore
  public call(instructions: Instructions, labels: string[], commandLabels: CommandLabelRow[], debugMode: true): () => SelectedRowWithDebug[]
  // prettier-ignore
  public call( instructions: Instructions, labels: string[], commandLabels: CommandLabelRow[], debugMode: boolean) {
    if (labels.length === 0) return () => []
    const templateStr = template(labels, instructions, commandLabels, debugMode)
    const statement = this.database.prepare(templateStr)
    return (): SelectedRow[] => statement.all()
  }
}

export {
  SelectOrderedLabeledValues,
  // type exports
  SelectedRow,
  SelectedRowWithDebug
}
