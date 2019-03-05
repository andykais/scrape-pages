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

const defaults: {
  definition: Pick<ScrapeConfig, 'incrementUntil'>
  download: Pick<DownloadConfig, 'method' | 'headerTemplates'>
  parse: Pick<ParseConfig, 'expect'>
} = {
  definition: {
    incrementUntil: 0
  },
  download: {
    method: 'GET',
    headerTemplates: {}
  },
  parse: {
    expect: 'html'
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

// TODO use type guards
const normalizeDownload = (download: DownloadConfigInit): DownloadConfig | undefined =>
  download === undefined
    ? undefined
    : typeof download === 'string'
      ? {
          ...defaults.download,
          urlTemplate: download
        }
      : {
          ...defaults.download,
          ...download,
          method: download.method || defaults.download.method
        }

const normalizeParse = (parse: ParseConfigInit): ParseConfig | undefined =>
  parse === undefined
    ? undefined
    : typeof parse === 'string'
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

const normalizeUndefinedSingleArray = <T>(val?: T | T[]): T[] =>
  val === undefined ? [] : Array.isArray(val) ? val : [val]

const normalizeStructure = ({ scraper, forNext, forEach }: ConfigInit['run']): Config['run'] => ({
  scraper,
  forNext: normalizeUndefinedSingleArray(forNext).map(normalizeStructure),
  forEach: normalizeUndefinedSingleArray(forEach).map(normalizeStructure)
})

const normalizeConfig = (config: ConfigInit): Config => {
  assertConfigType(config)

  return {
    input: normalizeInputs(config.input),
    scrapers: normalizeScraperDefs(config.scrapers),
    run: normalizeStructure(config.run)
  }
}

export { normalizeConfig }
