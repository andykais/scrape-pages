import { FMap } from '../../util/map'
// scraper name
export type ScraperName = string
// scraper group
type ScraperGroup = string
// input key
type InputKey = string
// npm import
type Import = string

// RegexCleanup {{{
type RegexRemove = string
type RegexReplace = {
  selector: string
  replacer: string
}
type RegexCleanup = RegexRemove | RegexReplace
// }}}

// Input {{{
type Input = InputKey
// }}}

// DownloadConfig {{{
// handlebars template
type Template = string
type UrlMethods = 'GET' | 'POST' | 'PUT' | 'DELETE'
interface DownloadConfigInterface {
  method?: UrlMethods
  urlTemplate: Template
  headerTemplates?: { [headerName: string]: Template }
  regexCleanup?: RegexCleanup
}
export type DownloadConfigInit = Template | DownloadConfigInterface
export interface DownloadConfig extends DownloadConfigInterface {
  method: UrlMethods
  headerTemplates: { [headerName: string]: Template }
}
// }}}

// ParseConfig {{{
type ExpectedFormats = 'html' | 'json'
type Selector = string
interface ParseConfigInterface {
  expect?: ExpectedFormats
  selector: Selector
  attribute?: string
  regexCleanup?: RegexCleanup
}
export type ParseConfigInit = Selector | ParseConfigInterface
export interface ParseConfig extends ParseConfigInterface {
  expect: ExpectedFormats
}
// }}}

type Incrementers = 'failed-download' | 'empty-parse' | number

// returned by ./flatten.ts
export type ConfigPositionInfo = {
  depth: number
  horizontalIndex: number
  name: ScraperName
  parentName?: ScraperName
}
export type FlatConfig = FMap<ScraperName, ConfigPositionInfo>

export interface ScrapeConfigInit {
  download?: DownloadConfigInit
  parse?: ParseConfigInit
  incrementUntil?: Incrementers
  limitValuesTo?: number
}
export interface ScrapeConfig {
  download?: DownloadConfig
  parse?: ParseConfig
  incrementUntil: Incrementers
  limitValuesTo: number | undefined
}
interface StructureInit {
  scraper: ScraperName
  scrapeEach?: StructureInit | StructureInit[]
  scrapeNext?: StructureInit | StructureInit[]
}
interface Structure extends StructureInit {
  scrapeEach: Structure[]
  scrapeNext: Structure[]
}
export interface ConfigInit {
  input?: Input | Input[]
  import?: Import | Import[]
  defs: { [scraperName: string]: ScrapeConfigInit }
  structure: StructureInit
}
// returned by ./normalize.ts
export interface Config extends ConfigInit {
  input: Input[]
  import: Import[]
  defs: { [scraperName: string]: ScrapeConfig }
  structure: Structure
}
