import * as errors from '@scrape-pages/util/error'
import { Instructions } from '@scrape-pages/types/instructions'
import * as I from '@scrape-pages/types/instructions'
import { sql, Query } from './query-base'
import { SelectedRow as CommandLabelRow } from './select-commands'

function getSelectedLabelsSql(labels: string[]) {
  return labels.map(s => `'${s}'`).join(',')
}
function getWaitingJoinsSql(
  instructions: Instructions,
  commandLabels: CommandLabelRow[],
  labels: string[]
) {
  if (labels.length < 2) return `cte.parentTreeId`

  function findLongestLevelTraversal(commandId: number, program: I.Program): [boolean, number] {
    let levelsTraversed = 0
    const operationsWithWrites = program.filter(p => p.operator !== 'until')
    for (let i = 0; i < operationsWithWrites.length; i++) {
      const operation = operationsWithWrites[i]

      switch (operation.operator) {
        case 'init':
          const j = operation.commands.findIndex(c => c.databaseId === commandId)
          if (j === -1) levelsTraversed += operation.commands.length
          else return [true, levelsTraversed + j]
          break
        case 'map':
          const k = operation.commands.findIndex(c => c.databaseId === commandId)
          if (k === -1) levelsTraversed += operation.commands.length
          else return [true, levelsTraversed + k]
          break
        case 'loop':
          const l = operation.commands.findIndex(c => c.databaseId === commandId)
          if (l === -1) levelsTraversed += operation.commands.length
          else return [true, levelsTraversed + l]
          break
        case 'branch':
          // let m = 0
          for (const program of operation.programs) {
            const [commandFound, n] = findLongestLevelTraversal(commandId, program)
            // if (n === -1)
            if (commandFound) return [commandFound, levelsTraversed + n]
            else levelsTraversed += n
            // otherwise Im not sure. We need to figure out branching
          }
          break
        default:
          throw new Error(`unknown operation '${operation.operator}'`)
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

  // for (const { id, maxLevelsTraversed } of maxLevelTraversalPerCommand) {
  //   if (maxLevelsTraversed === -1)
  //     throw new errors.InternalError(`could not find id ${id} in instructions`)
  // }

  console.log(maxLevelTraversalPerCommand.map(c => ({ maxLevelsTraversed: c.maxLevelsTraversed, ...commandLabels.find(l => l.id === c.id)})))
  // console.log(maxLevelTraversalPerCommand)

  const maxLevelsTraversal = Math.max(...maxLevelTraversalPerCommand.map(m => m.maxLevelsTraversed))

  const caseJoins = maxLevelTraversalPerCommand
    .filter(m => m.maxLevelsTraversed !== maxLevelsTraversal) // the deepest depth doesnt need to wait on anybody
    .map(m => {
      const recurseDepthWhenOtherCommandsMeetIt = maxLevelsTraversal - m.maxLevelsTraversed - 1
      // prettier-ignore
      return `cte.commandId = ${m.id} AND cte.recurseDepth < ${recurseDepthWhenOtherCommandsMeetIt}`
    })
    .join(' OR ')

  if (caseJoins.length === 0) return `cte.parentTreeId`

  console.log({ caseJoins })
  return `CASE WHEN ${caseJoins} THEN cte.id ELSE cte.parentTreeId END`

  // TODO we need command ids mapped to instructions. Otherwise we cannot resolve two commands with the same label
  // we will still input a label, but will walk over it like an array and then map each command id individually
  // count down to the furthest depth you can go (at branches or reduces we will need to resolve "merging" paths)
  //
  return `cte.parentTreeId`
}
function findLowestDepth(instructions: Instructions, labels: string[]) {
  return -1
}

const template = (
  labels: string[],
  instructions: Instructions,
  commandLabels: CommandLabelRow[],
  debugMode: boolean
) => {
  const ifDebugMode = (partialSql: string) => (debugMode ? partialSql : '')
  const unlessDebugMode = (partialSql: string) => (debugMode ? '' : partialSql)
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
    commands.id as commandId,
    commands.label,
    commands.id as currentCommandId
    ${ifDebugMode(`
      , commands.label as currentCommandLabel
    `)}
  FROM commands
  INNER JOIN crawlerTree ON crawlerTree.commandId = commands.id
  WHERE commands.label in (${getSelectedLabelsSql(labels)}) -- TODO can I swap the order here?
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
    cte.label,
    parentEntries.commandId as currentCommandId
    ${ifDebugMode(`
      , commands.label as currentCommandLabel
    `)}
  FROM cte
  INNER JOIN crawlerTree as parentEntries
  ON ${getWaitingJoinsSql(instructions, commandLabels, labels)} = parentEntries.id
  ${ifDebugMode(`
    INNER JOIN commands ON parentEntries.commandId = commands.id
  `)}
  -- WHERE recurseDepth < ${findLowestDepth(instructions, labels)}
  ORDER BY
    recurseDepth,
    valueIndex,
    operatorIndex
)
SELECT
  cte.label, -- TODO this should probably be a INNER JOIN instead of something we carry down
  cte.label,
  cte.value,
  networkRequests.filename,
  networkRequests.byteLength,
  networkRequests.status,
  networkRequests.requestParams
  ${ifDebugMode(`
  , recurseDepth, operatorIndex, valueIndex, currentCommandId, currentCommandLabel
  `)}
FROM cte
LEFT JOIN networkRequests ON cte.networkRequestId = networkRequests.id
${unlessDebugMode(`
-- WHERE recurseDepth = ${findLowestDepth(instructions, labels)}
`)}
-- ORDER BY
--   recurseDepth,
--   operatorIndex,
--   valueIndex
`
}

type SelectedRow = {
  label: string
  id: number
  value?: string
  // downloadData: string | null
  filename: string | null
  byteLength: string | null
  status: string | null
  requestParams: string | null
}

type SelectedRowWithDebug = SelectedRow & {
  requestId: number
  recurseDepth: number
  operatorIndex: number
  valueIndex: number
  currentCommandId: string // TODO replace with label? It can be done in the sql
  currentCommandLabel: string
}

// NOTE if the instructions change, your 'prepared' query will be out of wack with the current database.
// So, if the instructions change, you should prepare new queries.
class SelectOrderedLabeledValues extends Query {
  constructor(database: Query['database']) {
    super(database)
    // we cannot assign an anonymous function to `call` because it has overloads
    this.call = this.call.bind(this)
  }
  // TODO we want to pass in some sort of flattened structure that describes the commands
  public call(
    instructions: Instructions,
    labels: string[],
    commandLabels: CommandLabelRow[],
    debugMode: false
  ): () => SelectedRow[]
  // prettier-ignore
  public call(instructions: Instructions, labels: string[], commandLabels: CommandLabelRow[], debugMode: true): () => SelectedRowWithDebug[]
  public call(
    instructions: Instructions,
    labels: string[],
    commandLabels: CommandLabelRow[],
    debugMode: boolean
  ) {
    const templateStr = template(labels, instructions, commandLabels, debugMode)
    // console.log(templateStr)
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

sql`
WITH cte AS (
  SELECT
    parsedTree.id,
    downloads.id as downloadId,
    downloads.cacheId,
    downloads.complete,
    parsedValue,
    parentId,
    parseIndex,
    incrementIndex,
    0 as recurseDepth,
    downloads.scraper,
    parsedTree.scraper AS currentScraper
  FROM downloads
  LEFT JOIN parsedTree ON parsedTree.downloadId = downloads.id
  WHERE downloads.scraper in ({{{ selectedScrapers }}})
  UNION ALL
  SELECT
    pTree.id,
    cte.downloadId,
    cte.cacheId,
    cte.complete,
    cte.parsedValue,
    pTree.parentId,
    pTree.parseIndex,
    pDownloads.incrementIndex,
    cte.recurseDepth + 1,
    cte.scraper,
    pTree.scraper AS currentScraper
  FROM cte
  INNER JOIN parsedTree as pTree
  ON {{{ waitingJoinsSql }}} = pTree.id
  INNER JOIN downloads as pDownloads
  ON pTree.downloadId = pDownloads.id
  WHERE recurseDepth < {{lowestDepth}} -- this may be a problem, or it may be fine. This prevents extra work past what we calculate the maximum amount of work is
  ORDER BY
  recurseDepth, -- recurseDepth ensures that we move from the bottom of the tree to the top
  parseIndex, -- parseIndex orders by appearance on html/json
  incrementIndex, -- incrementIndex handles 'incrementUntil'
  parentId -- parentId handles 'scrapeNext'
)
SELECT
  cte.id,
  cte.scraper,
  parsedValue,
  downloadData, filename, byteLength, complete
{{#if debugMode}}
  , downloadId, recurseDepth, incrementIndex, parseIndex, currentScraper
{{/if}}
FROM cte
LEFT JOIN downloadCache ON downloadCache.id = cte.cacheId -- grab additional download information outside of ordering
{{#unless debugMode}}
  WHERE recurseDepth = {{lowestDepth}}
{{/unless}}
ORDER BY
  recurseDepth,
  incrementIndex,
  parseIndex
`
