import { findMin, findMax } from '../../util/array'
import { k_combinations } from './util/k_combinations'
import { findLowestCommonParent } from './util/find-lowest-common-parent'

const makeDynamicOrderLevelColumn = (flatConfig, levels) => {
  const recurse = levelsRecursed => {
    if (levelsRecursed.length < 2) return ''
    const combinations = k_combinations(levelsRecursed, 2)
    const parentObj = combinations.reduce((acc, pair) => {
      const parent = findLowestCommonParent(flatConfig, ...pair)
      acc[parent.name] = (acc[parent.name] || []).concat(pair)
      return acc
    }, {})

    const parentName = findMin(Object.keys(parentObj), (min, val) => {
      return flatConfig[min].depth < flatConfig[val].depth
    })
    const parent = flatConfig[parentName]
    const children = Array.from(new Set(parentObj[parentName]))

    const allDepthsEqual = children.every(c => c.depth === children[0].depth)
    const selectedLevels = allDepthsEqual
      ? children
      : [findMin(children, (min, val) => min.depth < val.depth)]
    const selectedString = selectedLevels.map(l => `'${l.name}'`).join(',')

    const caseSql = children.length
      ? `WHEN pTree.level = '${
          parent.name
        }' AND cte.startLevel IN (${selectedString}) THEN horizontalIndex `
      : ''

    const remainingLevels = Array.from(
      new Set(levelsRecursed.filter(l => !selectedLevels.includes(l)))
    )
    return caseSql + recurse(remainingLevels)
  }
  const cases = recurse(levels)
  if (cases) return `CASE ${cases}ELSE 0 END`
  else return '0'
}

export { makeDynamicOrderLevelColumn }
