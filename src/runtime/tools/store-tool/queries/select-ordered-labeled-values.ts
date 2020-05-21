import * as errors from '@scrape-pages/util/error'
import { Instructions } from '@scrape-pages/types/instructions'
import * as I from '@scrape-pages/types/instructions'
import { sql, Query } from './query-base'
import { SelectedRow as CommandLabelRow } from './select-commands'

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
  commandId: number
  currentCommandLabel: string
  currentCommandId: number
  commandSort: number
}

// collect info types
type SelectedCommandInfo = { command: I.Command; distanceFromTop: number }
type FurthestDistanceTraveled = number
type Info = { selectedCommands: SelectedCommandInfo[]; furthestDistanceTraveled: number }

class SelectOrderedLabeledValues extends Query {
  public constructor(database: Query['database']) {
    super(database)
    this.call = this.call.bind(this)
  }
  // public call: PreparedStatement['prepare'] = (...args: any[]) => {
  // prettier-ignore
  public call(instructions: Instructions, labels: string[], commandLabels: CommandLabelRow[], debugMode: false): () => SelectedRow[]
  // prettier-ignore
  public call(instructions: Instructions, labels: string[], commandLabels: CommandLabelRow[], debugMode: true): () => SelectedRowWithDebug[]
  // prettier-ignore
  public call( instructions: Instructions, labels: string[], commandLabels: CommandLabelRow[], debugMode: boolean) {
    if (labels.length === 0) return () => []

    const compiler = new QueryCompiler(instructions, labels, commandLabels)
    const templateVars = compiler.generateSqlFragments()

    const templateStr = template({ ...templateVars, debugMode })
    if (debugMode) console.log(templateStr) // eslint-disable-line no-console
    const statement = this.database.prepare(templateStr)
    return (): SelectedRow[] => statement.all()
  }
}

class QueryCompiler {
  private selectedCommandIds: number[]
  // collectInfo stateful vars
  private selectionOrderCases: { commandId: number; atRecurseDepth: number }[]
  private selectionWaitCasesV2: { commandId: number; stopWaitingAtDistanceFromTop: number }[]
  private mergingWaitCasesV2: {
    currentCommandId: number | null
    stopWaitingAtDistanceFromTop: number
  }[]

  public constructor(
    private instructions: Instructions,
    private labels: string[],
    private commandLabels: CommandLabelRow[]
  ) {
    this.selectedCommandIds = commandLabels
      .filter((c) => c.label && labels.includes(c.label))
      .map((c) => c.id)
  }

  public generateSqlFragments() {
    this.selectionOrderCases = []
    this.selectionWaitCasesV2 = []
    this.mergingWaitCasesV2 = []

    // prettier-ignore
    const { selectedCommands, furthestDistanceTraveled } = this.collectInfo(this.instructions.program, 0, 0, 0)

    // prettier-ignore
    selectedCommands
      .filter(({ command }) => !this.selectionOrderCases.find(c => c.commandId === command.databaseId))
      .forEach(({ command }) => {
        this.selectionOrderCases.push({
          commandId: command.databaseId!,
          atRecurseDepth: furthestDistanceTraveled - 1
        })
      })

    // prettier-ignore
    const caseSorts = this.selectionOrderCases
      .map(c =>`cte.commandId = ${c.commandId} AND cte.recurseDepth = ${c.atRecurseDepth - 1}`)
      .join(' OR ')

    // prettier-ignore
    const caseWaits = this.selectionWaitCasesV2
      .filter(c => c.stopWaitingAtDistanceFromTop !== furthestDistanceTraveled)
      .map(c => `cte.commandId = ${c.commandId} AND cte.recurseDepth < ${furthestDistanceTraveled - c.stopWaitingAtDistanceFromTop}`)
      .concat(this.mergingWaitCasesV2
        .filter(c => c.stopWaitingAtDistanceFromTop !== furthestDistanceTraveled)
        .map(c => `cte.currentCommandId = ${c.currentCommandId} AND cte.recurseDepth < ${furthestDistanceTraveled - c.stopWaitingAtDistanceFromTop}`)
      )
      .join(' OR ')

    return {
      selectedCommandIdsSql: this.selectedCommandIds.join(','),
      waitingJoinsSql: caseWaits
        ? `CASE WHEN ${caseWaits} THEN cte.id ELSE cte.parentTreeId END`
        : 'cte.parentTreeId',
      waitingSortSql: caseSorts ? `CASE WHEN ${caseSorts} THEN cte.commandId ELSE 0 END` : '0',
      furthestDistanceTraveled: furthestDistanceTraveled - 1,
    }
  }

  private collectInfo(
    program: I.Program,
    operationIndex: number,
    commandIndex: number,
    distanceFromTop: number,
    previousCommand?: I.Command
  ): Info {
    if (operationIndex < program.length) {
      const operation = program[operationIndex]
      switch (operation.operator) {
        case 'init':
        case 'map':
        case 'loop':
        case 'reduce': {
          if (commandIndex >= operation.commands.length) {
            // prettier-ignore
            return this.collectInfo(program, operationIndex + 1, 0, distanceFromTop, previousCommand)
          }

          const currentDistanceFromTop = distanceFromTop + 1
          const currentCommand = operation.commands[commandIndex]

          // prettier-ignore
          const childInfo = this.collectInfo(program, operationIndex, commandIndex + 1, currentDistanceFromTop, currentCommand)
          const { furthestDistanceTraveled } = childInfo

          if (this.commandIsSelected(currentCommand)) {
            const currentCommandInfo = {
              command: currentCommand,
              distanceFromTop: currentDistanceFromTop,
            }
            this.addConditionalWait(currentCommandInfo)

            const info = {
              selectedCommands: [currentCommandInfo, ...childInfo.selectedCommands],
              furthestDistanceTraveled,
            }
            if (childInfo.selectedCommands.length) {
              // prettier-ignore
              this.addConditionalSorts(info.selectedCommands, furthestDistanceTraveled, currentDistanceFromTop)
            }

            return info
          } else {
            return childInfo
          }
        }
        case 'merge': {
          const commandsFromMerge: SelectedCommandInfo[] = []
          const maxDistancePerBranch: number[] = []
          for (const program of operation.programs) {
            const mergeChildInfo = this.collectInfo(program, 0, 0, distanceFromTop, previousCommand)
            commandsFromMerge.push(...mergeChildInfo.selectedCommands)
            // find the lowest of commandsFromMerge
            maxDistancePerBranch.push(mergeChildInfo.furthestDistanceTraveled)
          }
          const furthestDistanceInBranches = Math.max(0, ...maxDistancePerBranch)

          // prettier-ignore
          const childInfo = this.collectInfo(program, operationIndex + 1, 0, furthestDistanceInBranches)
          const { furthestDistanceTraveled } = childInfo

          if (childInfo.selectedCommands.length) {
            for (const commandFromMerge of commandsFromMerge) {
              const mergedAndChildCommands = [commandFromMerge, ...childInfo.selectedCommands]
              // prettier-ignore
              this.addConditionalSorts(mergedAndChildCommands, furthestDistanceTraveled, commandFromMerge.distanceFromTop)
            }
            for (const programIndex of operation.programs.keys()) {
              if (maxDistancePerBranch[programIndex] < furthestDistanceInBranches) {
                this.addConditionalMergeWait(previousCommand, distanceFromTop)
              }
            }
          }

          return {
            selectedCommands: [...commandsFromMerge, ...childInfo.selectedCommands],
            furthestDistanceTraveled,
          }
        }
        // read only operators
        case 'until':
          return this.collectInfo(program, operationIndex + 1, 0, distanceFromTop, previousCommand)
        default:
          throw new errors.InternalError(`unknown operation '${operation.operator}'`)
      }
    }
    return { selectedCommands: [], furthestDistanceTraveled: distanceFromTop }
  }

  private addConditionalWait(commandInfo: SelectedCommandInfo) {
    this.selectionWaitCasesV2.push({
      commandId: commandInfo.command.databaseId!,
      stopWaitingAtDistanceFromTop: commandInfo.distanceFromTop,
    })
  }
  private addConditionalMergeWait(
    parentCommand: I.Command | undefined,
    currentDistanceFromTop: number
  ) {
    this.mergingWaitCasesV2.push({
      currentCommandId: parentCommand ? parentCommand.databaseId! : null,
      stopWaitingAtDistanceFromTop: currentDistanceFromTop,
    })
  }
  private addConditionalSorts(
    selectedCommands: SelectedCommandInfo[],
    maxDistanceFromBottom: number,
    currentDistanceFromTop: number
  ) {
    for (const { command } of selectedCommands) {
      this.selectionOrderCases.push({
        commandId: command.databaseId!,
        atRecurseDepth: maxDistanceFromBottom - currentDistanceFromTop,
      })
    }
  }
  private commandIsSelected(command: I.Command): boolean {
    return this.selectedCommandIds.includes(command.databaseId!)
  }
}

const template = (templateVars: {
  selectedCommandIdsSql: string
  waitingJoinsSql: string
  waitingSortSql: string
  furthestDistanceTraveled: number
  debugMode: boolean
}) => {
  const {
    selectedCommandIdsSql,
    waitingJoinsSql,
    waitingSortSql,
    furthestDistanceTraveled,
    debugMode,
  } = templateVars
  const ifDebugMode = (partialSql: string) => (debugMode ? partialSql : '')
  const unlessDebugMode = (partialSql: string) =>
    debugMode ? `-- NO_DEBUG ${partialSql}` : partialSql

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
  ORDER BY
    recurseDepth,
    valueIndex,
    operatorIndex,
    commandSort desc
)
SELECT
  -- ${waitingSortSql} as commandSort,
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

export {
  SelectOrderedLabeledValues,
  // type exports
  SelectedRow,
  SelectedRowWithDebug,
}
