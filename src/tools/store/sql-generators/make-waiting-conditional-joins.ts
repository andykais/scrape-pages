// type imports
import { FlatConfig, ConfigPositionInfo, FlowStep } from '../../../settings/config/types'

const makeWaitingConditionalJoins = (flatConfig: FlatConfig, scraperNames: string[]) => {
  // console.log(flatConfig)

  const levels = scraperNames.map(flatConfig.getOrThrow).sort((a, b) => b.depth - a.depth)
  const numLevelsTraversedByEachScraper = scraperNames
    .map(flatConfig.getOrThrow)
    .map(scraperInfo => {})

  const countDeepestParent = (flatConfig: FlatConfig, scraperInfo: ConfigPositionInfo): number => {
    if (scraperInfo.parentName) {
      const parentScraperInfo = flatConfig.getOrThrow(scraperInfo.parentName)
      // hopefully this will only capture merging configs
      // it doesnt. theres an issue with parents being captured where its just the branch. I need to know when its an immediate parent and when its a merging parent
      // console.log(scraperInfo.name, scraperInfo.horizontalIndex, parentScraperInfo.horizontalIndex)
      // if (scraperInfo.mergeParent) {
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
          const flattened = [...maxBranchDepth, ...maxRecurseDepth].reduce((acc, array) => {
            acc.push(...array)
            return acc
          }, [])
          return Math.max(scraperInfo.depth, ...flattened)
        }
        const deepestDepth = findDeepestLevel(parentScraperInfo.configAtPosition)
        const amountTraversed = deepestDepth - parentScraperInfo.depth
        const amountTraversedUnderParent = countDeepestParent(flatConfig, parentScraperInfo)
        if (amountTraversedUnderParent) {
          // console.log('z', scraperInfo.name, 1 + amountTraversed + amountTraversedUnderParent)
          return 1 + amountTraversed + amountTraversedUnderParent
        } else {
          // console.log('z', scraperInfo.name, 1 + amountTraversed)
          return 1 + amountTraversed
        }
      } else {
        const amountTraversedUnderParent = countDeepestParent(flatConfig, parentScraperInfo)
        if (amountTraversedUnderParent) {
          // console.log(scraperInfo.name, 1 + amountTraversedUnderParent)
          return 1 + amountTraversedUnderParent
        } else {
          // console.log(scraperInfo.name, 0)
          return 0
        }
      }
    }
    return 0
  }
  const maxLevelsTraversedByEachScraper = scraperNames
    .map(flatConfig.getOrThrow)
    .map(scraperInfo => {
      // console.log('counting deepest for', scraperInfo.name)
      const longestDepthTraversedByScraper = countDeepestParent(flatConfig, scraperInfo)
      // find out the same for the parents parent
      // return longestDepthTraversedByScraper
      // if (scraperInfo.name === 'image-page') return { scraperInfo, maxLevelsTraversed: 1 }
      return { scraperInfo, maxLevelsTraversed: longestDepthTraversedByScraper }
    })
    .sort((a, b) => a.maxLevelsTraversed - b.maxLevelsTraversed)

  // console.log(
  //   maxLevelsTraversedByEachScraper.map(scraper => ({
  //     name: scraper.scraperInfo.name,
  //     depth: scraper.maxLevelsTraversed
  //   }))
  // )
  // console.log(levels.map(level => ({ name: level.name, depth: level.depth })))

  if (maxLevelsTraversedByEachScraper.length === 0) return 'cte.parentId'
  // const lowestDepth = levels[0].depth
  // const levelsThatWillWait = levels.filter(l => l.depth !== lowestDepth)

  // const caseJoins = levelsThatWillWait
  //   .map(level => {
  //     const waitingSteps = Array(lowestDepth - level.depth)
  //       .fill(null)
  //       .map((_, recurseDepth) => recurseDepth)
  //       .join(',')

  //     return `cte.scraper = '${level.name}' AND cte.recurseDepth IN (${waitingSteps})`
  //   })
  //   .join(' OR ')

  // pop the deepest depth
  const deepestDepth = maxLevelsTraversedByEachScraper.pop()!.maxLevelsTraversed
  // console.log(maxLevelsTraversedByEachScraper)

  const caseJoins = maxLevelsTraversedByEachScraper
    .map(({ scraperInfo, maxLevelsTraversed }) => {
      const waitingSteps = Array(deepestDepth - maxLevelsTraversed)
        .fill(null)
        .map((_, recurseDepth) => recurseDepth)
        .join(',')

      // if (level.name === 'image-page')
      //   return `WHEN cte.scraper = '${level.name}' AND cte.recurseDepth IN (0,1,2) THEN cte.id`
      // else
      return `cte.scraper = '${scraperInfo.name}' AND cte.recurseDepth IN (${waitingSteps})`
    })
    .join(' OR ')
  return `CASE WHEN ${caseJoins} THEN cte.id ELSE cte.parentId END`

  //const lowestDepth = Math.max(...maxLevelsTraversedByEachScraper)
  //const deepestDepth = Math.min(...maxLevelsTraversedByEachScraper)
  //const levelsThatWillWait = levels.filter(l => l.name !== deepestDepth)
  //// const lowestDepth = levels[0].depth
  //// const levelsThatWillWait = levels.filter(l => l.depth !== lowestDepth)
  //console.log({ maxLevelsTraversedByEachScraper })
  //// then we run in through the following

  //const caseJoins = levelsThatWillWait
  //  .map(level => {
  //    // for each level, look at the parent for branches, if the parent has branches, go to the deepest branch. add horizontal and vertical. This is the deepest
  //    //
  //    // TODO recursion needs to exist to account for the branches.
  //    // We need to account for the deepest branch above something
  //    const waitingSteps = Array(lowestDepth - level.depth)
  //      .fill(null)
  //      .map((_, recurseDepth) => recurseDepth)
  //      .join(',')

  //    // if (level.name === 'image-page')
  //    //   return `WHEN cte.scraper = '${level.name}' AND cte.recurseDepth IN (0,1,2) THEN cte.id`
  //    // else
  //    return `cte.scraper = '${level.name}' AND cte.recurseDepth IN (${waitingSteps})`
  //    // return `WHEN cte.scraper = '${level.name}' AND cte.recurseDepth IN (${waitingSteps}) THEN cte.id`
  //  })
  //  .join(' OR ')
  //if (caseJoins) return `CASE WHEN ${caseJoins} THEN cte.id ELSE cte.parentId END`
  //else return 'cte.parentId'
}

//import { Settings } from '../../../settings'

//// TODO rename (and makeLevelOrderJoins) from make to compile. It sounds cooler
//const makeWaitingConditionalJoins_V2 = (
//{ flatConfig, config }: Settings,
//scraperNames: string[]
//) => {
//console.log(flatConfig)
//console.log(config)

//const levels = scraperNames.map(flatConfig.getOrThrow).sort((a, b) => b.depth - a.depth)
//const maxLevelsTraversedByEachScraper = scraperNames
//  .map(flatConfig.getOrThrow)
//  .filter(scraperInfo => scraperInfo.parentName)
//  .map(scraperInfo => {
//    const parentScraperInfo = flatConfig.getOrThrow(scraperInfo.parentName!)
//    // const traverseToDeepest = (flowStep) => {

//    // }
//  })
//// then we run in through the following

//const lowestDepth = levels[0].depth
//const levelsThatWillWait = levels.filter(l => l.depth !== lowestDepth)

//const caseJoins = levelsThatWillWait
//  .map(level => {
//    // for each level, look at the parent for branches, if the parent has branches, go to the deepest branch. add horizontal and vertical. This is the deepest
//    //
//    // TODO recursion needs to exist to account for the branches.
//    // We need to account for the deepest branch above something
//    const waitingSteps = Array(lowestDepth - level.depth)
//      .fill(null)
//      .map((_, recurseDepth) => recurseDepth)
//      .join(',')

//    // if (level.name === 'image-page')
//    //   return `WHEN cte.scraper = '${level.name}' AND cte.recurseDepth IN (0,1,2) THEN cte.id`
//    // else
//    return `cte.scraper = '${level.name}' AND cte.recurseDepth IN (${waitingSteps})`
//    // return `WHEN cte.scraper = '${level.name}' AND cte.recurseDepth IN (${waitingSteps}) THEN cte.id`
//  })
//  .join(' OR ')
//if (caseJoins) return `CASE WHEN ${caseJoins} THEN cte.id ELSE cte.parentId END`
//else return 'cte.parentId'
// }

export { makeWaitingConditionalJoins }
