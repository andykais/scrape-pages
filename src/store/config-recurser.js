import k_combinations from '../util/k_combinations'

/*
 *   G
 *   |
 *   P
 *  / \
 * T   I
 *
 * findLowestCommonParent(T, I) => P
 */
export const findLowestCommonParent = (flatConfig, level1, level2) => {
  const recurse = (level1, level2) => {
    const level1Parent = flatConfig[level1.parentName]
    const level2Parent = flatConfig[level2.parentName]
    if (level1 === level2) return level1
    if (!level1 || !level2 || !level1Parent || !level2Parent) return null

    const commonParent1 = recurse(level1Parent, level2)
    if (commonParent1) return commonParent1

    const commonParent2 = recurse(level1, level2Parent)
    if (commonParent2) return commonParent2
  }
  return recurse(level1, level2)
}

const createJoinAtRightTime = (lower, higher) => {
  if (lower.depth === higher.depth) return ''

  const stepsToSkip = Array(lower.depth - higher.depth)
    .fill(maxDepth)
    .map((max, i) => max - lower.depth + i)

  return `CASE WHEN startLevel = '${
    lower.name
  }' AND recurseDepth IN (${stepsToSkip.join(',')})`
}

// levels === Array<{ LCP: string, depth: number, name: string }>
// export
const makeJoinsOnlyAtAppropriateLevels = levels => {
  levels.sort(l => l.depth)
  // findLowestCommonParent for all combinations of levels
  // take the lowest of the low:
  // then returns the createJoinAtRightTime() + orderByLowestCommonParent(levels.filter(thoseTwoLevels).push(lowestCommonParent))
}

export const makeDynamicOrderLevelColumns = (flatConfig, levels) => {
  const recurse = levelsRecursed => {
    if (levelsRecursed.length === 1) return ''
    const combinations = k_combinations(levelsRecursed, 2)
    const parentObj = combinations.reduce((acc, pair) => {
      const parent = findLowestCommonParent(...pair)
      acc[parent.name] = (acc[parent.name] || []).push(...pair)
      return acc
    }, {})

    const [parent, children] = Object.entries(parent).reduce(
      (min, [parent, children]) => {
        if (!min || min[0].depth < parent.depth) return [parent, children]
        else return min
      },
      null
    )
    // CASE WHEN pTree.level = 'p' AND cte.startLevel IN ('t', 'i') THEN startLevel ELSE 0 END as levelOrder
    // return `WHEN pTree.level = '${}'`
    const childrenThatAreOutputted = children.filter(c => levels.includes(c))
    const caseSql = childrenThatAreOutputted.length
      ? `WHEN pTree.level = '${
          parent.name
        }' AND cte.startLevel IN (${childrenThatAreOutputted
          .map(l => `'${l}'`)
          .join(',')}) THEN startLevel`
      : ''

    const levelsWithoutLowestChildren = levelsRecursed.filter(
      l => !children.includes(l)
    )
    return caseSql + recurse([parent, ...levelsWithoutLowestChildren])
  }
  return recurse(levels)
}
