import { validateSlug } from '../../util/slug'
import { VError } from 'verror'
import * as t from './types'
import {
  DownloadConfigInit,
  DownloadConfig,
  ParseConfigInit,
  ParseConfig,
  Scraper,
  ConfigInit,
  RegexCleanupInit,
  Config
} from './types'
import { typecheckConfig } from '../../util/typechecking.runtime'

const reservedWords = ['value', 'index']

const defaults: {
  definition: Pick<Scraper, 'incrementUntil'>
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
        format: 'html',
        selector: parse,
        regexCleanup: undefined
      }
    : parse.format === 'json'
    ? {
        ...parse,
        regexCleanup: normalizeRegexCleanup(parse.regexCleanup)
      }
    : parse.format === 'xml'
    ? {
        ...parse,
        regexCleanup: normalizeRegexCleanup(parse.regexCleanup)
      }
    : {
        ...parse,
        regexCleanup: normalizeRegexCleanup(parse.regexCleanup),
        format: 'html'
      }

const normalizeUndefinedSingleArray = <T>(val: undefined | T | T[]): T[] =>
  val === undefined ? [] : Array.isArray(val) ? val : [val]

const normalizeScraper = (scraperInit: t.ScraperInit): t.Scraper => {
  try {
    validateSlug(scraperInit.name)
  } catch (e) {
    throw new VError({ name: e.name, cause: e }, 'For a scraper name')
  }

  return {
    ...defaults.definition,
    ...scraperInit,
    download: normalizeDownload(scraperInit.download),
    parse: normalizeParse(scraperInit.parse)
  }
}

const isScraperInit = (flowStepInit: t.FlowInitStepOrScraper): flowStepInit is t.ScraperInit =>
  'name' in flowStepInit

const normalizeFlow = (flowInit: t.ConfigInit['flow']): t.Config['flow'] =>
  flowInit.map(flowInitStep => {
    if (isScraperInit(flowInitStep)) {
      return {
        scrape: normalizeScraper(flowInitStep),
        branch: [],
        recurse: []
      }
    } else {
      // man the pipeline proposal would be useful here https://github.com/tc39/proposal-pipeline-operator
      return {
        scrape: normalizeScraper(flowInitStep.scrape),
        branch: normalizeUndefinedSingleArray(flowInitStep.branch).map(flow => normalizeFlow(flow)),
        recurse: normalizeUndefinedSingleArray(flowInitStep.recurse).map(flow =>
          normalizeFlow(flow)
        )
      }
    }
  })

const normalizeConfig = (configInit: t.ConfigInit): t.Config => {
  typecheckConfig(configInit)
  return {
    input: normalizeInputs(configInit.input),
    flow: normalizeFlow(configInit.flow)
  }
}

export { normalizeConfig }
