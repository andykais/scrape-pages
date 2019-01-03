import {
  DownloadConfigInit,
  DownloadConfig,
  ParseConfigInit,
  ParseConfig,
  ScrapeConfigInit,
  ConfigInit,
  Config
} from './types'
import { assertConfigType } from './runtime/assert'
const runtimeAssertConfig: any = assertConfigType

const downloadDefaults: Partial<DownloadConfig> = {
  method: 'GET',
  headerTemplates: {}
}
const assignDownloadDefaults = (download: DownloadConfigInit): DownloadConfig =>
  typeof download === 'string'
    ? {
        ...downloadDefaults,
        urlTemplate: download,
        method: downloadDefaults.method
      }
    : {
        ...downloadDefaults,
        ...download,
        method: download.method || downloadDefaults.method
      }

const parseDefaults: Partial<ParseConfig> = {
  expect: 'html',
  attribute: undefined
}
const assignParseDefaults = (parse: ParseConfigInit): ParseConfig =>
  typeof parse === 'string'
    ? {
        ...parseDefaults,
        selector: parse,
        expect: parseDefaults.expect
      }
    : {
        ...parseDefaults,
        ...parse,
        expect: parse.expect || parseDefaults.expect
      }

const fillInDefaultsRecurse = (level = 0, parentName = '') => (
  scrapeConfig: ScrapeConfigInit,
  index = 0
): Config['scrape'] => {
  if (!scrapeConfig) return undefined

  const {
    name,
    download,
    parse,
    incrementUntil,
    scrapeNext,
    scrapeEach = []
  } = scrapeConfig

  const internalName = `${parentName}${
    parentName ? '-' : ''
  }level_${level}_index_${index}${scrapeNext ? '_next' : ''}`

  return {
    name: name || internalName,
    download: download && assignDownloadDefaults(download),
    parse: parse && assignParseDefaults(parse),
    incrementUntil: incrementUntil || 0,
    scrapeNext: fillInDefaultsRecurse(level + 1, parentName)(scrapeNext),
    scrapeEach: Array.isArray(scrapeEach)
      ? scrapeEach.map(fillInDefaultsRecurse(level + 1, parentName))
      : [fillInDefaultsRecurse(level + 1)(scrapeEach)]
  }
}

const standardizeInput = (input: ConfigInit['input']): Config['input'] => {
  if (!input) return []
  else return Array.isArray(input) ? input : [input]
}

const normalizeConfig = (config: ConfigInit): Config => {
  runtimeAssertConfig(config)

  const input = standardizeInput(config.input)

  const fullConfig = fillInDefaultsRecurse()(config.scrape)

  return {
    input,
    scrape: fullConfig
  }
}
export { normalizeConfig }
