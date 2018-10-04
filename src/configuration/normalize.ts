import {
  UrlMethods,
  DownloadConfig,
  ParseConfig,
  ScrapeConfig,
  Config,
  FullConfig
} from './config'
import { assertConfigType } from './runtime/assert'
const runtimeAssertConfig: any = assertConfigType

const downloadDefaults: Partial<DownloadConfig> = {
  method: 'GET',
  increment: 0,
  headerTemplates: {},
  cookieTemplates: {}
}
const assignDownloadDefaults = (download: DownloadConfig): DownloadConfig =>
  typeof download === 'string'
    ? {
        ...downloadDefaults,
        urlTemplate: download
      }
    : {
        ...downloadDefaults,
        ...download
      }

const parseDefaults: Partial<ParseConfig> = {
  expect: 'html',
  attribute: undefined
}
const assignParseDefaults = (parse: ParseConfig): ParseConfig =>
  typeof parse === 'string'
    ? {
        ...parseDefaults,
        selector: parse
      }
    : {
        ...parseDefaults,
        ...parse
      }

const fillInDefaultsRecurse = (level = 0, parentName = '') => (
  scrapeConfig: ScrapeConfig,
  index = 0
): FullConfig['scrape'] => {
  if (!scrapeConfig) return undefined

  const { name, download, regexCleanup, parse, scrapeEach = [] } = scrapeConfig

  const internalName = `${parentName}${
    parentName ? '-' : ''
  }level_${level}_index_${index}`

  return {
    name: name || internalName,
    download: download && assignDownloadDefaults(download),
    parse: parse && assignParseDefaults(parse),
    regexCleanup: regexCleanup,
    scrapeEach: Array.isArray(scrapeEach)
      ? scrapeEach.map(fillInDefaultsRecurse(level + 1, parentName))
      : [fillInDefaultsRecurse(level + 1)(scrapeEach)]
  }
}

const standardizeInput = (input: Config['input']): Config['input'] => {
  if (!input) return []
  else return Array.isArray(input) ? input : [input]
}

const normalizeConfig = (config: Config): FullConfig => {
  runtimeAssertConfig(config)

  const input = standardizeInput(config.input)

  const fullConfig = fillInDefaultsRecurse()(config.scrape)

  return {
    input,
    scrape: fullConfig
  }
}
export default normalizeConfig
