import { createAssertType } from 'typescript-is'
import * as fp from '@scrape-pages/util/function'
import { TypeUtils, Settings } from '@scrape-pages/types/internal'
import { RuntimeBase } from '@scrape-pages/runtime/runtime-base'
import { Store } from './index'
import * as typechecking from '@scrape-pages/types/runtime-typechecking'
// type imports
// import { SelectedRow as OrderedValuesRow } from './queries/select-ordered-labeled-values'
import { Querier } from '@scrape-pages/types/internal'

class QuerierApi {
  // I believe I also need the command instances (with depths)
  public constructor(private database: Store, private settings: Settings) {}

  public prepare: Querier.Interface['prepare'] = (labels, options = {}) => {
    // separating out functions from serializable properties.
    // TODO report on the prior issue: https://github.com/woutervh-/typescript-is/issues/50
    const { inspector, ...typecheckableOptions } = options
    typechecking.typecheckQueryApiLabels(labels)
    typechecking.typecheckQueryApiOptions(typecheckableOptions)

    const { instructions } = this.settings

    // we initialize the database from inside this folder so we can use the querier without giving it an initialize function the user needs to call
    // we reuse the store created by ScraperProgram, so this should always be true
    this.initializeOnce()

    const includeGroupByRow = options.groupBy && labels.includes(options.groupBy)

    const commandLabels = this.database.qs.selectCommands() // itd be nice if we could call this from selectOrderedLabeledValues directly
    const selectedLabels = labels
      .concat(options.groupBy || [])
      .filter(label => commandLabels.find(c => c.label === label))
      .filter((label, i, labels) => labels.indexOf(label) === i)

    const groupLabels = selectedLabels.filter(
      label => label !== options.groupBy && !includeGroupByRow
    )
    const idMap = selectedLabels.reduce(
      (acc, label) => {
        const { id } = commandLabels.find(c => c.label === label)!
        acc[id] = label
        return acc
      },
      {} as { [id: number]: string }
    )
    const groupByCommand = commandLabels.find(c => c.label === options.groupBy)
    const groupById = groupByCommand ? groupByCommand.id : undefined

    // const selectedLabels = options.groupBy ? labels.concat(options.groupBy) : labels
    // const labelsThatExist = labels.filter(label => commandLabels.find(c => c.label === label))
    const stmt = this.database.qs.selectOrderedLabeledValues(
      instructions,
      selectedLabels,
      commandLabels,
      false
    )

    return () => {
      if (options.inspector) {
        const debugStmt = this.database.qs.selectOrderedLabeledValues(
          instructions,
          selectedLabels,
          commandLabels,
          true
        )
        options.inspector(debugStmt())
      }

      const rows = stmt()
      const result: Querier.QueryResult = []
      let group: Querier.OrderedValuesGroup = {}
      for (const label of groupLabels) group[label] = []
      let pushedValuesInGroup = false
      for (const row of rows) {
        const isGroupByRow = row.commandId === groupById
        if (includeGroupByRow || !isGroupByRow) {
          group[idMap[row.commandId]].push(row)
          pushedValuesInGroup = true
        }
        if (isGroupByRow) {
          // if (pushedValuesInGroup) result.push(group)
          result.push(group)
          group = {}
          for (const label of groupLabels) group[label] = []
          pushedValuesInGroup = false
        }
      }
      if (pushedValuesInGroup) result.push(group)

      return result
    }
  }
  private initialize = () => {
    if (Store.databaseIsInitialized(this.settings.folder)) {
      // we could already be initialized if .start() was called on this same runtime instance
      if (!this.database.isInitialized()) this.database.initialize({ initializeTables: false })
    } else {
      // prettier-ignore
      throw new Error(`There is no database at '${this.settings.folder}'. The scraper must be ran at least once bfore querying from the database.`)
    }
  }
  private initializeOnce = fp.once(this.initialize)
}

export { QuerierApi }
