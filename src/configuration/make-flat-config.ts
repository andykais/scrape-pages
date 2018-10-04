import { FullConfig, FlatConfig } from './config'

const makeFlatConfig = (fullConfig: FullConfig): FlatConfig => {
  const recurse = (
    config: FullConfig['scrape'],
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
