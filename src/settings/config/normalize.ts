import {
  DownloadConfigInit,
  DownloadConfig,
  ParseConfigInit,
  ParseConfig,
  ScrapeConfigInit,
  ConfigInit,
  Config
} from './types'
import { assertConfigType } from './'

const downloadDefaults: {
  headerTemplates: DownloadConfig['headerTemplates']
  method: DownloadConfig['method']
} = {
  method: 'GET',
  headerTemplates: {}
}
// TODO use type guards
const assignDownloadDefaults = (download: DownloadConfigInit): DownloadConfig =>
  typeof download === 'string'
    ? {
        ...downloadDefaults,
        urlTemplate: download
      }
    : {
        ...downloadDefaults,
        ...download,
        method: download.method || downloadDefaults.method
      }

const parseDefaults: {
  expect: ParseConfig['expect']
  attribute: ParseConfig['attribute']
} = {
  expect: 'html',
  attribute: undefined
}
const assignParseDefaults = (parse: ParseConfigInit): ParseConfig =>
  typeof parse === 'string'
    ? {
        ...parseDefaults,
        selector: parse
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
    download:
      download === undefined ? undefined : assignDownloadDefaults(download),
    parse: parse === undefined ? undefined : assignParseDefaults(parse),
    incrementUntil: incrementUntil || 0,
    scrapeNext:
      scrapeNext && fillInDefaultsRecurse(level + 1, parentName)(scrapeNext),
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
  assertConfigType(config)

  const input = standardizeInput(config.input)

  const fullConfig = fillInDefaultsRecurse()(config.scrape)

  return {
    input,
    scrape: fullConfig
  }
}
export { normalizeConfig }
