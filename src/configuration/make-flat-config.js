const makeFlatConfig = fullConfig => {
  const recurse = (
    config,
    parentName = null,
    depth = 0,
    horizontalIndex = 0
  ) => {
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
