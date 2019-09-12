import { findLowestCommonParent } from './util/find-lowest-common-parent'
// type imports
import { FlatConfig, ConfigPositionInfo } from '../../../settings/config/types'

/**
 * ensures that when multiple scrapes are selected at once, the proper order is attached at each level of the
 * tree
 */
const makeDynamicOrderLevelColumn = (flatConfig: FlatConfig, scraperNames: string[]) => {
  if (scraperNames.length < 2) {
    return '0'
  } else {
    const ancestors: { [scrapeName: string]: ConfigPositionInfo[] } = {}
    let lowestDepth = 0

    for (const currentName of scraperNames) {
      const current = flatConfig.getOrThrow(currentName)
      let min: ConfigPositionInfo | null = null
      if (lowestDepth < current.depth) lowestDepth = current.depth
      for (const comparisonName of scraperNames) {
        const comparison = flatConfig.getOrThrow(comparisonName)
        if (current.name !== comparison.name) {
          const commonAncestor = findLowestCommonParent(flatConfig, current, comparison)
          if (!min || min.depth < commonAncestor.depth) {
            min = commonAncestor
          }
        }
      }
      ancestors[min!.name] = ancestors[min!.name] || []
      ancestors[min!.name].push(current)
    }

    const diagonalOrderColumn = Object.keys(ancestors)
      .map(commonParentName => {
        const orderAtRecurseDepth = lowestDepth - flatConfig.getOrThrow(commonParentName).depth - 1
        const scrapersToOrder = ancestors[commonParentName]
        return scrapersToOrder
          .map(({ name, depth, horizontalIndex }) => {
            // TODO this is insufficient for large scrapers (e.g. horizontal index is larger than Math.pow(10, depth))
            // to remedy, we should make the tuples ahead of time, then order them ourselves here and actually output a simple list
            // e.g. horVertOrders = [[1,2], [12,0],[100,2]] => [0,1,2]
            // const horizontalVerticalOrder = `${Math.pow(10, depth)}-${horizontalIndex}`
            const horizontalVerticalOrder = Math.pow(10, depth) + horizontalIndex
            return `WHEN cte.scraper = '${name}' AND recurseDepth = ${orderAtRecurseDepth} THEN ${horizontalVerticalOrder}`
          })
          .join(' ')
      })
      .join(' ')

    const largestHorizontalVerticalIndex = Math.pow(10, lowestDepth + 1)

    console.log(`CASE ${diagonalOrderColumn} ELSE ${largestHorizontalVerticalIndex} END`)
    return `CASE ${diagonalOrderColumn} ELSE ${largestHorizontalVerticalIndex} END`
  }
}

export { makeDynamicOrderLevelColumn }
