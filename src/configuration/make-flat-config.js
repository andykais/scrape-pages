const makeFlatConfig = fullConfig => {
  const recurse = (config, depth, parentName) => {
    const { name } = config
    // console.log(config)
    const childConfigs = config.scrapeEach.reduce(
      (acc, scraper) => ({
        ...acc,
        ...recurse(scraper, depth + 1, name)
      }),
      {}
    )
    return {
      [name]: {
        name,
        depth,
        parentName
      },
      ...childConfigs
    }
  }
  return recurse(fullConfig.scrape, 0, null)
}
export { makeFlatConfig }
