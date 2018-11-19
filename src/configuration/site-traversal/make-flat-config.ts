import { Config, FlatConfig } from './types'

const makeFlatConfig = (fullConfig: Config): FlatConfig => {
  const recurse = (
    config: Config['scrape'],
    parentName: string = null,
    depth = 0,
    horizontalIndex = 0
  ): FlatConfig => {
    const { name } = config
    const childConfigs = config.scrapeEach.reduce(
      (acc, scraper, horizontalIndex) => ({
        ...acc,
        ...recurse(scraper, name, depth + 1, horizontalIndex)
      }),
      {}
    )
    return {
      [name]: {
        name,
        parentName,
        depth,
        horizontalIndex
      },
      ...childConfigs
    }
  }
  return recurse(fullConfig.scrape)
}
export { makeFlatConfig }
