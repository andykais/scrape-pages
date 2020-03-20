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
  public constructor(private database: Store, private settings: Settings) {}

  public prepare: Querier.Interface['prepare'] = (labels, options = {}) => {
    typechecking.typecheckQueryApiLabels(labels)
    typechecking.typecheckQueryApiOptions(options)

    // we initialize the database from inside this folder so we can use the querier without giving it an initialize function the user needs to call
    // we reuse the store created by ScraperProgram, so this should always be true
    this.initializeOnce()
    // TODO filter out labels that do not exist
    labels = labels.filter(label => true)

    const includeGroupByRow = options.groupBy && labels.includes(options.groupBy)
    const allLabels = options.groupBy ? labels.concat(options.groupBy) : labels
    const stmt = this.database.qs.selectOrderedLabeledValues(this.settings.instructions, allLabels)

    return (): Querier.QueryResult => {
      if (options.debugger) options.debugger(this.database, this.settings.instructions, allLabels)

      const rows = stmt()
      const result: Querier.QueryResult = []
      let group: Querier.OrderedValuesGroup = {}
      let pushedValuesInGroup = false
      for (const row of rows) {
        const isGroupByRow = row.label === options.groupBy
        if (includeGroupByRow || !isGroupByRow) {
          group[row.label].push(row)
          pushedValuesInGroup = true
        }
        if (isGroupByRow) {
          if (pushedValuesInGroup) result.push(group)
          group = {}
          for (const label of labels) group[label] = []
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
      if (!this.database.isInitialized) this.database.initialize()
    } else {
      // prettier-ignore
      throw new Error(`There is no database at '${this.settings.folder}'. The scraper must be ran at least once bfore querying from the database.`)
    }
  }
  private initializeOnce = fp.once(this.initialize)
}

export { QuerierApi }
