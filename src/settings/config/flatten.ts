import { FMap } from '../../util/map'
import { Config, FlatConfig } from './types'

const flattenConfig = (config: Config): FlatConfig => {
  const recurse = (
    structure: Config['structure'],
    parentName?: string,
    depth = 0,
    horizontalIndex = 0
  ): FlatConfig => {
    const { scraper } = structure
    const eachConfigs = structure.scrapeEach.reduce(
      (map, child, horizontalIndex) =>
        map.merge(recurse(child, scraper, depth + 1, horizontalIndex)),
      new FMap()
    )
    // previously scrapeNext depth & horizontalIndex were disregarded, add functional test to prove it is not problem
    // recurse(child)
    const nextConfigs = structure.scrapeNext.reduce(
      (map, child, horizontalIndex) =>
        map.merge(recurse(child, scraper, depth + 1, horizontalIndex)),
      new FMap()
    )

    return new FMap()
      .set(scraper, {
        name: scraper,
        parentName,
        depth,
        horizontalIndex
      })
      .merge(eachConfigs)
      .merge(nextConfigs)
  }
  return recurse(config.structure)
}
export { flattenConfig }
