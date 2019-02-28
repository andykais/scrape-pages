import { FMap } from '../../util/map'
import { Config, FlatConfig } from './types'

const flattenConfig = (config: Config): FlatConfig => {
  const recurse = (
    structure: Config['run'],
    parentName?: string,
    depth = 0,
    horizontalIndex = 0
  ): FlatConfig => {
    const { scraper } = structure
    const eachConfigs = structure.forEach.reduce(
      (map, child, horizontalIndex) =>
        map.merge(recurse(child, scraper, depth + 1, horizontalIndex)),
      new FMap()
    )
    // previously forNext depth & horizontalIndex were disregarded, add functional test to prove it is not problem
    // recurse(child)
    const nextConfigs = structure.forNext.reduce(
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
  return recurse(config.run)
}
export { flattenConfig }
