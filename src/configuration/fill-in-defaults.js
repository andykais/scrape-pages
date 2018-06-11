const defaultsParse = {
  expect: 'html',
  attribute: undefined,
  singular: false,
  regex_cleanup: undefined
}

const defaultsBuildUrl = {
  // increment: false, // TODO reenabled after fix with flow-runtime
  template: '{parentValue}',
  regex_cleanup: undefined
}
const defaultsBuildUrlIncrement = {
  ...defaultsBuildUrl,
  increment: true,
  initial_index: 0,
  increment_by: 1
}

const fillInDefaultsRecurse = (parseConfig, { level = 0, index = 0 } = {}) => {
  if (!parseConfig) return undefined
  const { name, parse, build_url, scrape_each } = parseConfig

  return {
    name: name || `level_${level}_index_${index}`,
    parse: parse
      ? {
          ...defaultsParse,
          ...parse
        }
      : undefined,
    build_url: {
      ...(build_url && build_url.increment
        ? defaultsBuildUrlIncrement
        : defaultsBuildUrl),
      ...build_url
    },
    scrape_each: scrape_each
      ? Array.isArray(scrape_each)
        ? scrape_each.map((scrape, index) =>
            fillInDefaultsRecurse(scrape, { level: level + 1, index })
          )
        : [fillInDefaultsRecurse(scrape_each, { level: level + 1 })]
      : undefined
  }
}

const fillInDefaults = config => {
  const fullConfig = fillInDefaultsRecurse(config.scrape)
  return {
    input: undefined,
    ...config,
    scrape: fullConfig
  }
}
export default fillInDefaults
