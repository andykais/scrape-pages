const parseDefaults = {
  attribute: undefined,
  singular: false,
  regex_cleanup: undefined
}

const buildUrlDefaults = {
  increment: false,
  expect: 'html',
  regex_cleanup: undefined
}
const buildUrlIncrementDefaults = {
  ...buildUrlDefaults,
  increment: true,
  initial_index: 0,
  increment_by: 1
}

const fillInDefaultsRecurse = parseConfig => {
  if (!parseConfig) return undefined

  return {
    parse: parseConfig.parse
      ? {
          ...parseDefaults,
          ...parseConfig.parse
        }
      : undefined,
    build_url: {
      ...(parseConfig.build_url && parseConfig.build_url.increment
        ? buildUrlIncrementDefaults
        : buildUrlDefaults),
      ...parseConfig.build_url
    },
    scrape_each: fillInDefaultsRecurse(parseConfig.scrape_each)
  }
}

const fillInDefaults = config => {
  const fullConfig = fillInDefaultsRecurse(config.scrape)
  return {
    input: undefined,
    ...config,
    scrape: fullConfig
    // ...fullConfig
  }
}
export default fillInDefaults
