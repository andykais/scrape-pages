import {
  DownloadConfigInit,
  DownloadConfig,
  ParseConfigInit,
  ParseConfig,
  // replacement
  ScrapeConfigInit,
  ScrapeConfig,
  ConfigInit,
  Config
} from './types'
import { assertConfigType } from './'

const defaults = {
  definitions: {
    incrementUntil: 0
  },
  download: {
    method: 'GET' as DownloadConfig['method'],
    headerTemplates: {} as DownloadConfig['headerTemplates']
  },
  parse: {
    expect: 'html' as ParseConfig['expect'],
    attribute: undefined as ParseConfig['attribute']
  }
}

// TODO use type guards
const normalizeDownload = (download: DownloadConfigInit): DownloadConfig =>
  typeof download === 'string'
    ? {
        ...defaults.download,
        urlTemplate: download
      }
    : {
        ...defaults.download,
        ...download,
        method: download.method || defaults.download.method
      }

const normalizeParse = (parse: ParseConfigInit): ParseConfig =>
  typeof parse === 'string'
    ? {
        ...defaults.parse,
        selector: parse
      }
    : {
        ...defaults.parse,
        ...parse,
        expect: parse.expect || defaults.parse.expect
      }

// const fillInDefaultsRecurse = (level = 0, parentName = '') => (
//   scrapeConfig: ScrapeConfigInit,
//   index = 0
// ): Config['scrape'] => {
//   const {
//     name,
//     download,
//     parse,
//     incrementUntil,
//     scrapeNext,
//     scrapeEach = []
//   } = scrapeConfig

//   const internalName = `${parentName}${
//     parentName ? '-' : ''
//   }level_${level}_index_${index}${scrapeNext ? '_next' : ''}`

//   return {
//     name: name || internalName,
//     download:
//       download === undefined ? undefined : assignDownloadDefaults(download),
//     parse: parse === undefined ? undefined : assignParseDefaults(parse),
//     incrementUntil: incrementUntil || 0,
//     scrapeNext:
//       scrapeNext && fillInDefaultsRecurse(level + 1, parentName)(scrapeNext),
//     scrapeEach: Array.isArray(scrapeEach)
//       ? scrapeEach.map(fillInDefaultsRecurse(level + 1, parentName))
//       : [fillInDefaultsRecurse(level + 1)(scrapeEach)]
//   }
// }

// const standardizeInput = (input: ConfigInit['input']): Config['input'] => {
//   if (!input) return []
//   else return Array.isArray(input) ? input : [input]
// }

// const normalizeConfig = (config: ConfigInit): Config => {
//   assertConfigType(config)

//   const input = standardizeInput(config.input)

//   const fullConfig = fillInDefaultsRecurse()(config.scrape)

//   return {
//     input,
//     scrape: fullConfig
//   }
// }
// export { normalizeConfig }

const normalizeDefinition = (scrapeConfig: ScrapeConfigInit): ScrapeConfig => ({
  ...defaults.definitions,
  ...scrapeConfig,
  download:
    scrapeConfig.download === undefined
      ? undefined
      : normalizeDownload(scrapeConfig.download),
  parse:
    scrapeConfig.parse === undefined
      ? undefined
      : normalizeParse(scrapeConfig.parse)
})

const normalizeUndefinedSingleArray = <T>(val?: T | T[]): T[] =>
  val === undefined ? [] : Array.isArray(val) ? val : [val]

const normalizeStructure = ({
  scraper,
  scrapeNext,
  scrapeEach
}: ConfigInit['structure']): Config['structure'] => ({
  scraper,
  scrapeNext: normalizeUndefinedSingleArray(scrapeNext).map(normalizeStructure),
  scrapeEach: normalizeUndefinedSingleArray(scrapeEach).map(normalizeStructure)
})

const normalizeConfig = (config: ConfigInit): Config => {
  // assertConfigType(config)

  const defs = Object.keys(config.defs).reduce(
    (acc, scraperName) => ({
      ...acc,
      [scraperName]: normalizeDefinition(config.defs[scraperName])
    }),
    {}
  )

  return {
    input: normalizeUndefinedSingleArray(config.input),
    import: normalizeUndefinedSingleArray(config.import),
    defs,
    structure: normalizeStructure(config.structure)
  }
}

export { normalizeConfig }
