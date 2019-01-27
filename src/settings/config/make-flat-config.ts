import { Config, FlatConfig } from './types'

const makeFlatConfig = (config: Config): FlatConfig => {
  const recurse = (
    structure: Config['structure'],
    parentName?: string,
    depth = 0,
    horizontalIndex = 0
  ): FlatConfig => {
    const { scraper } = structure
    const eachConfigs = structure.scrapeEach.reduce(
      (acc, child, horizontalIndex) => ({
        ...acc,
        ...recurse(child, scraper, depth + 1, horizontalIndex)
      }),
      {}
    )
    const nextConfigs = structure.scrapeNext.reduce(
      (acc, child, horizontalIndex) => ({
        ...acc,
        // ...recurse(child, scraper, depth + 1, horizontalIndex), // possible improvement, test ordering
        ...recurse(child)
      }),
      {}
    )

    return {
      [scraper]: {
        name: scraper,
        parentName,
        depth,
        horizontalIndex
      },
      ...eachConfigs,
      ...nextConfigs
    }
  }
  return recurse(config.structure)
}
export { makeFlatConfig }
