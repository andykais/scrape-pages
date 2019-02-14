import { FlatConfig, ConfigPositionInfo } from '../../../../settings/config/types'
/*
 *   G
 *   |
 *   P
 *  / \
 * T   I
 *
 * findLowestCommonParent(T, I) => P
 */
export const findLowestCommonParent = (
  flatConfig: FlatConfig,
  scraperA: ConfigPositionInfo,
  scraperB: ConfigPositionInfo
): ConfigPositionInfo => {
  if (scraperA.parentName === null) return scraperA
  if (scraperB.parentName === null) return scraperB
  const recurse = (
    scraperA?: ConfigPositionInfo,
    scraperB?: ConfigPositionInfo
  ): Voidable<ConfigPositionInfo> => {
    if (scraperA === scraperB) return scraperA
    if (
      scraperA === undefined ||
      scraperB === undefined ||
      scraperA.parentName === undefined ||
      scraperB.parentName === undefined
    )
      return

    const scraperAParent = flatConfig.getOrThrow(scraperA.parentName)
    const scraperBParent = flatConfig.getOrThrow(scraperB.parentName)
    if (!scraperAParent || !scraperBParent) return

    const commonParent1 = recurse(scraperAParent, scraperB)
    if (commonParent1) return commonParent1

    const commonParent2 = recurse(scraperA, scraperBParent)
    if (commonParent2) return commonParent2
  }
  // make sure the level lower on the tree is second
  return recurse(...[scraperA, scraperB].sort((a, b) => b.depth - a.depth)) || scraperA
}
