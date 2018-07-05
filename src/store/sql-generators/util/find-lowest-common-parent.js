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
  // make sure the level lower on the tree is second
  return recurse(...[level1, level2].sort((a, b) => b.depth - a.depth))
}
