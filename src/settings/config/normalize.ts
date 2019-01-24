import {
  DownloadConfigInit,
  DownloadConfig,
  ParseConfigInit,
  ParseConfig,
  ScrapeConfigInit,
  ConfigInit,
  Config,
  // replacement
  ScrapeConfigInit2,
  ScrapeConfig2,
  ConfigInit2,
  Config2
} from './types'
import { assertConfigType } from './'

const downloadDefaults = {
  method: 'GET' as DownloadConfig['method'],
  headerTemplates: {} as DownloadConfig['headerTemplates']
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

const defaults = {
  definitions: {
    incrementUntil: 0
  }
}
const normalizeDefinition = (
  scrapeConfig: ScrapeConfigInit2
): ScrapeConfig2 => ({
  ...defaults.definitions,
  ...scrapeConfig,
  download:
    scrapeConfig.download === undefined
      ? undefined
      : assignDownloadDefaults(scrapeConfig.download),
  parse:
    scrapeConfig.parse === undefined
      ? undefined
      : assignParseDefaults(scrapeConfig.parse)
})

const normalizeUndefinedSingleArray = <T>(val?: T | T[]): T[] =>
  val === undefined ? [] : Array.isArray(val) ? val : [val]

const normalizeStructure = ({
  scraper,
  scrapeNext,
  scrapeEach
}: ConfigInit2['structure']): Config2['structure'] => ({
  scraper,
  scrapeNext: normalizeUndefinedSingleArray(scrapeNext).map(normalizeStructure),
  scrapeEach: normalizeUndefinedSingleArray(scrapeEach).map(normalizeStructure)
})

const normalizeConfig2 = (config: ConfigInit2): Config2 => {
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

export { normalizeConfig2 }
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { ParsedValue, ScrapeStep } from '../../scraper/scrape-step'
import { wrapError } from '../../util/error'

const buildStructure = (
  config: Config2,
  scrapers: { [scraperName: string]: ScrapeStep }
) => {
  const recurse = (structure: Config2['structure']) => {
    // const scraper = scrapers[structure.scraper]
    const each = structure.scrapeEach.map(({ scraper }) => scrapers[scraper])
    const next = structure.scrapeNext.map(({ scraper }) => scrapers[scraper])

    return (parentValues: ParsedValue[]): Rx.Observable<ParsedValue[]> =>
      Rx.from(parentValues).pipe(
        ops.catchError(wrapError(`scraper '${this.scraperName}'`)),
        ops.flatMap(value =>
          Rx.merge(
            ...each.map(child => child.incrementObservableFunction(value))
          )
        )
      )
  }
  const scraper = scrapers[config.structure.scraper]
  return (inputValues: ParsedValue[]) =>
    Rx.from(inputValues).pipe(
      ops.flatMap(scraper.incrementObservableFunction),
      ops.flatMap(recurse(config.structure))
    )

  return (parseValues: ParsedValue[]) => recurse(config.structure)
}
