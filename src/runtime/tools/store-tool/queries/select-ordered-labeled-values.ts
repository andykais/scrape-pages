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

  // TODO we can potentially simplify this to only do ordering on group by keys. Otherwise, should we care?
  const selectionOrderCases: { commandId: number; atRecurseDepth: number }[] = []

  type SelectedCommandInfo = { commandId: number; distanceFromTop: number }
  type FurthestDistanceTraveled = number
  type Info = {commandsInfo: SelectedCommandInfo[], furthestDistanceTraveled: number}
  function walk(program: I.Program, operationIndex: number, commandIndex: number, distanceFromTop: number): Info {
    // const selectedCommands: { commandId: number; } = []

    if (operationIndex < program.length) {
      const operation = program[operationIndex]
      // console.log(`operator: ${operation.operator}, operationIndex: ${operationIndex}, commandIndex: ${commandIndex}, distanceFromTop: ${distanceFromTop}`)
      // console.log({ operator: operation.operator, operationIndex, commandIndex, distanceFromTop })
      switch (operation.operator) {
        case 'init':
        case 'map':
        case 'loop':
        case 'reduce':
          if (commandIndex < operation.commands.length) {
            const currentDistanceFromTop = distanceFromTop + 1
            const childInfo = walk(program, operationIndex, commandIndex + 1, currentDistanceFromTop)
            const currentCommand = operation.commands[commandIndex]
            const commandId = currentCommand.databaseId!
            if (selectedCommandIds.includes(commandId)) {
              // console.log(operation.operator, 'found command', commandId, commandLabels.find(c => c.id === commandId), 'it has these children', childInfo)
              // this is where we will check if there is a parent.
              if (childInfo.commandsInfo.length) {
                selectionOrderCases.push({ commandId, atRecurseDepth: childInfo.furthestDistanceTraveled - currentDistanceFromTop })
              }
              for (const childCommandInfo of childInfo.commandsInfo) {
                console.log('were setting up waits for parent', commandId, { furthest: childInfo.furthestDistanceTraveled, distanceFromTop })
                selectionOrderCases.push({ commandId: childCommandInfo.commandId, atRecurseDepth: childInfo.furthestDistanceTraveled - currentDistanceFromTop})
              }

              return {
                commandsInfo: [{ commandId, distanceFromTop: currentDistanceFromTop }, ...childInfo.commandsInfo],
                furthestDistanceTraveled: childInfo.furthestDistanceTraveled
              }
            } else {
              return childInfo
            }
          } else {
            return walk(program, operationIndex + 1, 0, distanceFromTop)
          }
        case 'merge':
          const commandsFromMerge: SelectedCommandInfo[] = []
          let furthestDistanceInBranches = 0
          for (const program of operation.programs) {
            const mergeChildInfo = walk(program, 0, 0, distanceFromTop)
            console.log({ mergeChildInfo  })
            commandsFromMerge.push(...mergeChildInfo.commandsInfo)
            furthestDistanceInBranches = Math.max(furthestDistanceInBranches, mergeChildInfo.furthestDistanceTraveled)
          }
          // find the lowest of commandsFromMerge
          const childInfo = walk(program, operationIndex + 1, 0, furthestDistanceInBranches)

          for (const commandFromMerge of commandsFromMerge) {
            console.log('merge found', commandFromMerge.commandId, commandLabels.find(c => c.id === commandFromMerge.commandId)!.label)
            for (const childCommandInfo of childInfo.commandsInfo) {

              console.log('    it has these children', childCommandInfo.commandId, commandLabels.find(c => c.id === childCommandInfo.commandId)!.label)
              // console.log(operation.operator, 'found command', commandId, commandLabels.find(c => c.id === commandId), 'it has these children', childInfo)
              selectionOrderCases.push({ commandId: childCommandInfo.commandId, atRecurseDepth: childInfo.furthestDistanceTraveled - commandFromMerge.distanceFromTop})
            }
            if (childInfo.commandsInfo.length) {
                selectionOrderCases.push({ commandId: commandFromMerge.commandId, atRecurseDepth: childInfo.furthestDistanceTraveled - commandFromMerge.distanceFromTop })
            }
          }
          // then make any childCommands wait on it (worry about after the initial setup)
          return {
            commandsInfo: [...commandsFromMerge, ...childInfo.commandsInfo],
            furthestDistanceTraveled: childInfo.furthestDistanceTraveled
          }
          // return [...commandsFromMerge, ...childCommands]
          break
        // read only operators
        case 'until':
          return walk(program, operationIndex + 1, 0, distanceFromTop)
        default:
          throw new errors.InternalError(`unknown operation '${operation.operator}'`)
      }
    }
    return { commandsInfo: [], furthestDistanceTraveled: distanceFromTop }
  }
  const info = walk(instructions.program, 0, 0, 0)
  for (const commandInfo of info.commandsInfo) {
    if (!selectionOrderCases.find(c => c.commandId === commandInfo.commandId)) {
      selectionOrderCases.push({ commandId: commandInfo.commandId, atRecurseDepth: info.furthestDistanceTraveled - 1 })
    }
  }
  console.log('===========================')
  console.log(info)
  console.log(selectionOrderCases)
  console.log('===========================')
//   caseSorts: 'cte.commandId = 4 AND cte.recurseDepth = 4 OR cte.commandId = 6 AND cte.recurseDepth = 4'

  // prettier-ignore
  const caseSorts = selectionOrderCases
    // .filter(c => c.distanceFromTop < info.furthestDistanceTraveled - 1) // lowest and second lowest selections will compare on the initial select, no need for case ordering
    .map(c =>`cte.commandId = ${c.commandId} AND cte.recurseDepth = ${c.atRecurseDepth - 1}`)
    .join(' OR ')

  // const caseSorts = `cte.commandId = 4 AND cte.recurseDepth = 2 OR cte.commandId = 6 AND cte.recurseDepth = 2`
  // const caseSorts = `cte.commandId = 3 AND cte.recurseDepth = 2 OR  cte.commandId = 4 AND cte.recurseDepth = 2 OR cte.commandId = 6 AND cte.recurseDepth = 2`

  // const caseSorts = selectionWaitCases
  //   // .filter(c => false) // lowest and second lowest selections will compare on the initial select, no need for case ordering
  //   .filter(c => c.distanceFromTop < furthestDistance - 1) // lowest and second lowest selections will compare on the initial select, no need for case ordering
  //   .map(c =>`cte.commandId = ${c.commandId}`)
  //   // .map(c =>`cte.commandId = ${c.commandId} AND cte.recurseDepth < ${4}`)
  //   .join(' OR ')
  
//   function itsAllRecursive(commands: I.Command[], commandIndex: number) {
//     const selectedCommands: { commandId: number; distanceFromTop: number } = []

//     if (commandsIndex < commands.length) {
//       const command = commands[commandsIndex]
//       const commandId = command.databaseId!
//       if (selectedCommandIds.includes(commandId)) {
//         selectedCommands.push({ commandId, distanceFromTop: -1 })
//       }
//       for (const foundCommand of itsAllRecursive(commands, commandsIndex+1)) {
//         selectedCommands.push(foundCommand)
//       }
//     }

//     return selectedCommands
//   }
  // function itsAllRecursive(operation: I.Operation, commandIndex: number) {
  //   if (index < operations.length - 1) {
  //     const operation = operations[index]
  //     const foundCommands = itsAllRecursive(operations, index+1)
  //   }

  // }
  function findSelectedCommands(
    program: I.Program,
    previousCommand?: I.Command,
    distanceFromTop: number = 0
  ) {
    let distance = 0

    const operationsWithWrites = program.filter(p => !READ_ONLY_OPERATORS.includes(p.operator))

    let prevCommand: I.Command | undefined = previousCommand

    const foundSelectedCommands: { commandId: number; distanceFromTop: number }[] = []
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
              foundSelectedCommands.push({ commandId, distanceFromTop: distanceFromTop + distance })
            }
          }
          break
        case 'merge':
          break
        default:
          throw new errors.InternalError(`unknown operation '${operation.operator}'`)
      }
    }
    return foundSelectedCommands
  }

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
              // console.log({label: commandLabels.find(c => c.id === commandId), distanceFromTop, distance })
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
        case 'merge':
          const maxDistances = operation.programs.map(p =>
            findFurthestDistanceTraveled(p, prevCommand, distanceFromTop + distance)
          )
          const maxMergeDistance = Math.max(...maxDistances)
          // console.log({ maxMergeDistance, distanceFromTop })

          // only do this if we have more instructions below that this will merge into
          if (i < operationsWithWrites.length - 1) {
            for (const [j, program] of operation.programs.entries()) {
              const maxDistanceForProgram = maxDistances[j]
              if (maxDistanceForProgram < maxMergeDistance) {
                const parentCommandId = prevCommand ? prevCommand.databaseId! : null
                mergingWaitCases.push({
                  currentCommandId: parentCommandId,
                  distanceFromTop: distance
                })
              }
            }
          }
          distance += maxMergeDistance
          break
        default:
          throw new errors.InternalError(`unknown operation '${operation.operator}'`)
      }
    }
    return distance
  }

  findFurthestDistanceTraveled(instructions.program)

  selectionWaitCases.sort((a, b) => a.distanceFromTop - b.distanceFromTop)
  console.log(selectionWaitCases)
  const furthestDistance = selectionWaitCases[selectionWaitCases.length - 1].distanceFromTop
  // console.log({ furthestDistance  })

  // prettier-ignore
  const caseWaits = selectionWaitCases
    .filter(c => c.distanceFromTop !== furthestDistance)
    .map(c => `cte.commandId = ${c.commandId} AND cte.recurseDepth < ${furthestDistance - c.distanceFromTop}`)
    // .map(c => `cte.commandId = ${c.commandId} AND cte.recurseDepth < ${2}`)
    .concat(mergingWaitCases
      .filter(c => c.distanceFromTop < furthestDistance)
      .map(c => `cte.currentCommandId = ${c.currentCommandId} AND cte.recurseDepth < ${furthestDistance - c.distanceFromTop}`)
     )
     // .filter(c => false)
    .join(' OR ')
  console.log({ caseWaits })
  console.log({ caseSorts })

  // prettier-ignore
  // const caseSorts = selectionWaitCases
  //   // .filter(c => false) // lowest and second lowest selections will compare on the initial select, no need for case ordering
  //   .filter(c => c.distanceFromTop < furthestDistance - 1) // lowest and second lowest selections will compare on the initial select, no need for case ordering
  //   .map(c =>`cte.commandId = ${c.commandId}`)
  //   // .map(c =>`cte.commandId = ${c.commandId} AND cte.recurseDepth < ${4}`)
  //   .join(' OR ')

  return {
    waitingJoinsSql: caseWaits
      ? `CASE WHEN ${caseWaits} THEN cte.id ELSE cte.parentTreeId END`
      : 'cte.parentTreeId',
    waitingSortSql: caseSorts ? `CASE WHEN ${caseSorts} THEN cte.commandId ELSE 0 END` : '0',
    // waitingSortSql: '0',
    // waitingSortSql: 'cte.commandId',
    // for the reuse label instructions:
    // waitingSortSql: `CASE WHEN cte.commandId = 3 AND cte.currentCommandId = 1 OR cte.commandId = 8 AND cte.currentCommandId = 1 THEN cte.commandId ELSE 0 END`,
  // waitingSortSql: 'cte.parentTreeId',
    // for the simple instructions:
    // waitingSortSql: 'CASE WHEN cte.commandId = 3 AND cte.currentCommandId = 3 OR cte.commandId = 4 AND cte.currentCommandId = 3 OR cte.commandId = 6 AND cte.currentCommandId = 3 THEN cte.commandId ELSE 0 END',
    // waitingSortSql: 'CASE WHEN cte.commandId = 3 AND cte.currentCommandId = 3 THEN cte.commandId ELSE 0 END',
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
  const unlessDebugMode = (partialSql: string) =>
    debugMode ? `-- NO_DEBUG ${partialSql}` : partialSql
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
    ${ifDebugMode(`, commands.label as currentCommandLabel`)}
  FROM crawlerTree
  ${ifDebugMode(`INNER JOIN commands ON crawlerTree.commandId = commands.id`)}
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
    ${ifDebugMode(`, commands.label as currentCommandLabel`)}
  FROM cte
  INNER JOIN crawlerTree as parentEntries
  ON ${waitingJoinsSql} = parentEntries.id
  ${ifDebugMode(`INNER JOIN commands ON parentEntries.commandId = commands.id`)}
  -- TODO add tail cleanup (WHERE recurseDepth >= cte.recurseDepth)
  ORDER BY
    recurseDepth,
    valueIndex,
    operatorIndex,
    commandSort desc
)
SELECT
    ${waitingSortSql} as commandSort,
  cte.value,
  cte.commandId,
  networkRequests.filename,
  networkRequests.byteLength,
  networkRequests.status,
  networkRequests.requestParams
  ${ifDebugMode(
    `, commands.label, parentTreeId, recurseDepth, operatorIndex, valueIndex, currentCommandLabel, currentCommandId`
  )}
FROM cte
${ifDebugMode(`INNER JOIN commands ON commands.id = cte.commandId`)}
LEFT JOIN networkRequests ON cte.networkRequestId = networkRequests.id
${unlessDebugMode(`WHERE cte.recurseDepth = ${furthestDistanceTraveled}`)}
  ORDER BY
    recurseDepth
  -- valueIndex
  --   -- operatorIndex,
    -- commandSort desc
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
  currentCommandId: number
  commandSort: number
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
      console.log("CREATE TEMPLATE")
    const templateStr = template(labels, instructions, commandLabels, debugMode)
    if (debugMode) console.log(templateStr)
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
