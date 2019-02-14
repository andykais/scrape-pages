import { validateSlug } from '../../util/slug'
import VError from 'verror'
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

const reservedWords = ['value', 'index']

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
    throw new VError({ name: e.name, cause: e }, 'For an input key, ')
  }
  return inputs
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

const normalizeDefinition = (scrapeConfig: ScrapeConfigInit): ScrapeConfig => ({
  ...defaults.definitions,
  ...scrapeConfig,
  download:
    scrapeConfig.download === undefined ? undefined : normalizeDownload(scrapeConfig.download),
  parse: scrapeConfig.parse === undefined ? undefined : normalizeParse(scrapeConfig.parse)
})

const normalizeDefs = (defs: ConfigInit['defs']) => {
  return Object.keys(defs).reduce((acc: Config['defs'], scraperName) => {
    try {
      validateSlug(scraperName)
      acc[scraperName] = normalizeDefinition(defs[scraperName])
      return acc
    } catch (e) {
      throw new VError({ name: e.name, cause: e }, 'For a scraper name, ')
    }
  }, {})
}

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
  assertConfigType(config)

  return {
    input: normalizeInputs(config.input),
    import: normalizeUndefinedSingleArray(config.import),
    defs: normalizeDefs(config.defs),
    structure: normalizeStructure(config.structure)
  }
}

export { normalizeConfig }
