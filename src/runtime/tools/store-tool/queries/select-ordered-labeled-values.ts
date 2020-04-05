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
      case 'reduce':
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
const READ_ONLY_OPERATORS = ['until']

function walkInstructions(
  instructions: Instructions,
  commandLabels: CommandLabelRow[],
  labels: string[]
) {
  const selectedCommandIds = commandLabels
    .filter(c => c.label && labels.includes(c.label))
    .map(c => c.id)

  const mergingWaitCases: { currentCommandId: number | null; distanceFromTop: number }[] = []
  const selectionWaitCases: { commandId: number; distanceFromTop: number }[] = []

  function findFurthestDistanceTraveled(
    program: I.Program,
    previousCommand?: I.Command,
    distanceFromTop: number = 0
  ): number {
    let distance = 0

    const operationsWithWrites = program.filter(p => !READ_ONLY_OPERATORS.includes(p.operator))

    let prevCommand: I.Command | undefined

    for (const [i, operation] of operationsWithWrites.entries()) {
      switch (operation.operator) {
        case 'init':
        case 'map':
        case 'loop':
        case 'reduce':
          for (const [j, command] of operation.commands.entries()) {
            distance++
            const commandId = command.databaseId!
            if (selectedCommandIds.includes(commandId)) {
              selectionWaitCases.push({
                commandId,
                distanceFromTop: distanceFromTop + distance
              })
            }
          }
          prevCommand = operation.commands.length
            ? operation.commands[operation.commands.length - 1]
            : prevCommand
          break
        case 'branch':
          const maxDistances = operation.programs.map(p =>
            findFurthestDistanceTraveled(p, prevCommand, distance)
          )
          const maxBranchDistance = Math.max(...maxDistances)

          // only do this if we have more instructions below that this will merge into
          if (i < operationsWithWrites.length - 1) {
            for (const [j, program] of operation.programs.entries()) {
              const maxDistanceForProgram = maxDistances[j]
              if (maxDistanceForProgram < maxBranchDistance) {
                const parentCommandId = prevCommand ? prevCommand.databaseId! : null
                mergingWaitCases.push({
                  currentCommandId: parentCommandId,
                  distanceFromTop: distance
                })
              }
            }
          }
          distance += maxBranchDistance
          break
        default:
          throw new errors.InternalError(`unknown operation '${operation.operator}'`)
      }
    }
    return distance
  }

  findFurthestDistanceTraveled(instructions.program)

  selectionWaitCases.sort((a, b) => a.distanceFromTop - b.distanceFromTop)
  const furthestDistance = selectionWaitCases[selectionWaitCases.length - 1].distanceFromTop

  // prettier-ignore
  const caseWaits = selectionWaitCases
    .filter(c => c.distanceFromTop !== furthestDistance)
    .map(c => `cte.commandId = ${c.commandId} AND cte.recurseDepth < ${furthestDistance - c.distanceFromTop}`)
    .concat(mergingWaitCases
      .filter(c => c.distanceFromTop < furthestDistance)
      .map(c => `cte.currentCommandId = ${c.currentCommandId} AND cte.recurseDepth < ${furthestDistance - c.distanceFromTop}`)
     )
    .join(' OR ')

  // prettier-ignore
  const caseSorts = selectionWaitCases
    .filter(c => c.distanceFromTop < furthestDistance - 1) // lowest and second lowest selections will compare on the initial select, no need for case ordering
    .map(c =>`cte.commandId = ${c.commandId} AND cte.recurseDepth < ${furthestDistance - c.distanceFromTop}`)
    .join(' OR ')

  return {
    waitingJoinsSql: caseWaits
      ? `CASE WHEN ${caseWaits} THEN cte.id ELSE cte.parentTreeId END`
      : 'cte.parentTreeId',
    waitingSortSql: caseSorts ? `CASE WHEN ${caseSorts} THEN cte.commandId ELSE 0 END` : '0',
    furthestDistanceTraveled: furthestDistance - 1
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
  ${ifDebugMode(`
    INNER JOIN commands ON crawlerTree.commandId = commands.id
  `)}
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
  , commands.label, parentTreeId, recurseDepth, operatorIndex, valueIndex, currentCommandLabel
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
  parentTreeId: number
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
