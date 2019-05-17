import { validateSlug } from '../../util/slug'
import { VError } from 'verror'
import {
  DownloadConfigInit,
  DownloadConfig,
  ParseConfigInit,
  ParseConfig,
  // replacement
  ScrapeConfigInit,
  ScrapeConfig,
  ConfigInit,
  RegexCleanupInit,
  Config
} from './types'
import { typecheckConfig } from '../../util/typechecking.runtime'

const reservedWords = ['value', 'index']

const defaults: {
  definition: Pick<ScrapeConfig, 'incrementUntil'>
  download: Pick<DownloadConfig, 'method' | 'headerTemplates' | 'protocol' | 'read' | 'write'>
  parse: Pick<ParseConfig, 'format'>
} = {
  definition: {
    incrementUntil: 0
  },
  download: {
    method: 'GET',
    protocol: 'http',
    headerTemplates: {},
    read: true,
    write: false
  },
  parse: {
    format: 'html'
  }
}

const normalizeInputs = (inputsInit: ConfigInit['input']) => {
  const inputs = normalizeUndefinedSingleArray(inputsInit)
  // make sure no reserved words are used as input keys
  const matchingReserves = reservedWords.filter(reserved => inputs.includes(reserved))
  if (matchingReserves.length) {
    throw new Error(`[${matchingReserves.join()}] are reserved word(s). The cannot be input names.`)
  }
  try {
    for (const input of inputs) validateSlug(input)
  } catch (e) {
    throw new VError({ name: e.name, cause: e }, 'For an input key')
  }
  return inputs
}

const normalizeRegexCleanup = (regexCleanupInit?: RegexCleanupInit) => {
  if (regexCleanupInit) {
    return typeof regexCleanupInit === 'string'
      ? {
          selector: regexCleanupInit,
          replacer: '',
          flags: 'g'
        }
      : {
          ...regexCleanupInit,
          flags: regexCleanupInit.flags || 'g'
        }
  }
}

// TODO use type guards
const normalizeDownload = (download: DownloadConfigInit): DownloadConfig | undefined =>
  download === undefined
    ? undefined
    : typeof download === 'string'
    ? {
        ...defaults.download,
        urlTemplate: download,
        regexCleanup: undefined
      }
    : {
        ...defaults.download,
        ...download,
        regexCleanup: normalizeRegexCleanup(download.regexCleanup),
        protocol: download.protocol || defaults.download.protocol,
        method: download.method || defaults.download.method
      }

const normalizeParse = (parse: ParseConfigInit): ParseConfig | undefined =>
  parse === undefined
    ? undefined
    : typeof parse === 'string'
    ? {
        ...defaults.parse,
        selector: parse,
        regexCleanup: undefined
      }
    : {
        ...defaults.parse,
        ...parse,
        regexCleanup: normalizeRegexCleanup(parse.regexCleanup),
        format: parse.format || defaults.parse.format
      }

const normalizeDefinition = (scrapeConfig: ScrapeConfigInit): ScrapeConfig => ({
  ...defaults.definition,
  ...scrapeConfig,
  download: normalizeDownload(scrapeConfig.download),
  parse: normalizeParse(scrapeConfig.parse)
})

const normalizeScraperDefs = (scraperDefs: ConfigInit['scrapers']) => {
  return Object.keys(scraperDefs).reduce((acc: Config['scrapers'], scraperName) => {
    try {
      validateSlug(scraperName)
      acc[scraperName] = normalizeDefinition(scraperDefs[scraperName])
      return acc
    } catch (e) {
      throw new VError({ name: e.name, cause: e }, 'For a scraper name')
    }
  }, {})
}

const normalizeUndefinedSingleArray = <T>(val: undefined | T | T[]): T[] =>
  val === undefined ? [] : Array.isArray(val) ? val : [val]

const normalizeStructure = (scrapers: ConfigInit['scrapers']) => ({
  scraper,
  forNext,
  forEach
}: ConfigInit['run']): Config['run'] => {
  if (!scrapers[scraper]) throw new Error(`config.scrapers is missing scraper "${scraper}"`)
  return {
    scraper,
    forNext: normalizeUndefinedSingleArray(forNext).map(normalizeStructure(scrapers)),
    forEach: normalizeUndefinedSingleArray(forEach).map(normalizeStructure(scrapers))
  }
}

const normalizeConfig = (configInit: ConfigInit): Config => {
  typecheckConfig(configInit)

  return {
    input: normalizeInputs(configInit.input),
    scrapers: normalizeScraperDefs(configInit.scrapers),
    run: normalizeStructure(configInit.scrapers)(configInit.run)
  }
}

export { normalizeConfig }
