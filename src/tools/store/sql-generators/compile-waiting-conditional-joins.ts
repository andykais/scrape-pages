import { flatten } from '../../../util/array'
// type imports
import { FlatConfig, ConfigPositionInfo, FlowStep } from '../../../settings/config/types'

const countLongestDepthTraversed = (
  flatConfig: FlatConfig,
  scraperInfo: ConfigPositionInfo
): number => {
  if (scraperInfo.parentName) {
    const parentScraperInfo = flatConfig.getOrThrow(scraperInfo.parentName)
    const amountTraversedUnderParent = countLongestDepthTraversed(flatConfig, parentScraperInfo)

    const isDirectChild =
      parentScraperInfo.configAtPosition.branch.some(
        flowStep => flowStep[0].scrape.name === scraperInfo.name
      ) ||
      parentScraperInfo.configAtPosition.recurse.some(
        flowStep => flowStep[0].scrape.name === scraperInfo.name
      )

    if (!isDirectChild) {
      const findDeepestLevel = (flowStep: FlowStep): number => {
        const scraperInfo = flatConfig.getOrThrow(flowStep.scrape.name)
        const maxBranchDepth = flowStep.branch.map(flowSteps => flowSteps.map(findDeepestLevel))
        const maxRecurseDepth = flowStep.recurse.map(flowSteps => flowSteps.map(findDeepestLevel))
        return Math.max(scraperInfo.depth, ...flatten([...maxBranchDepth, ...maxRecurseDepth]))
      }
      const deepestDepth = findDeepestLevel(parentScraperInfo.configAtPosition)
      const amountTraversed = deepestDepth - parentScraperInfo.depth
      return 1 + amountTraversed + amountTraversedUnderParent
    } else {
      return 1 + amountTraversedUnderParent
    }
  }
  return 0
}

const compileWaitingConditionalJoins = (flatConfig: FlatConfig, scraperNames: string[]) => {
  if (scraperNames.length < 2) return 'cte.parentId'

  const maxLevelsTraversedByEachScraper = scraperNames
    .map(flatConfig.getOrThrow)
    .map(scraperInfo => ({
      scraperInfo,
      maxLevelsTraversed: countLongestDepthTraversed(flatConfig, scraperInfo)
    }))
    .sort((a, b) => a.maxLevelsTraversed - b.maxLevelsTraversed)

  // pop the deepest depth, it doesnt need to wait on anybody
  const deepestDepth = maxLevelsTraversedByEachScraper.pop()!.maxLevelsTraversed

  const caseJoins = maxLevelsTraversedByEachScraper
    .map(({ scraperInfo, maxLevelsTraversed }) => {
      const recurseDepthWhenOtherScrapersMeetIt = deepestDepth - maxLevelsTraversed
      return `cte.scraper = '${scraperInfo.name}' AND cte.recurseDepth < ${recurseDepthWhenOtherScrapersMeetIt}`
    })
    .join(' OR ')
  return `CASE WHEN ${caseJoins} THEN cte.id ELSE cte.parentId END`
}

export { compileWaitingConditionalJoins }
