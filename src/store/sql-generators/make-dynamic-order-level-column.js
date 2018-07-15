import { findMin, findMax } from '../../util/array'
import { k_combinations } from './util/k_combinations'
import { findLowestCommonParent } from './util/find-lowest-common-parent'

const makeDynamicOrderLevelColumn = (flatConfig, scraperNames) => {
  if (scraperNames.length < 2) {
    return '0'
  } else {
    const diagonalOrderColumn = scraperNames
      .map(name => flatConfig[name])
      .map(({ name, depth, horizontalIndex }) => {
        const horizontalVerticalOrder = Math.pow(10, depth) + horizontalIndex
        return `WHEN parsedTree.scraper = '${name}' THEN ${horizontalVerticalOrder}`
      })
      .join(' ')

    return `CASE ${diagonalOrderColumn} ELSE 0 END`
  }
}

export { makeDynamicOrderLevelColumn }
