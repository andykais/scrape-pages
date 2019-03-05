import { FMap } from '../../util/map'
// scraper name
export type ScraperName = string
// scraper group
type ScraperGroup = string
// input key
type InputKey = string

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
  limit?: number
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
}
export interface ScrapeConfig {
  download?: DownloadConfig
  parse?: ParseConfig
  incrementUntil: Incrementers
}
interface StructureInit {
  scraper: ScraperName
  forEach?: StructureInit | StructureInit[]
  forNext?: StructureInit | StructureInit[]
}
interface Structure extends StructureInit {
  forEach: Structure[]
  forNext: Structure[]
}
export interface ConfigInit {
  input?: Input | Input[]
  scrapers: { [scraperName: string]: ScrapeConfigInit }
  run: StructureInit
}
// returned by ./normalize.ts
export interface Config extends ConfigInit {
  input: Input[]
  scrapers: { [scraperName: string]: ScrapeConfig }
  run: Structure
}
