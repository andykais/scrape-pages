// scraper name
export type ScraperName = string
// scraper group
type ScraperGroup = string
// input key
type InputKey = string

// RegexCleanup {{{
type RegexRemove = string
interface RegexReplace {
  selector: string
  replacer: string
}
type RegexCleanup = RegexRemove | RegexReplace
// }}}

// Input {{{
type InputSimple = InputKey
type InputCleaned = {
  name: InputKey
  regexCleanup: RegexCleanup
}
type Input = InputSimple | InputCleaned
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

export interface ScrapeConfigInit {
  name?: ScraperName
  download?: DownloadConfigInit
  parse?: ParseConfigInit
  incrementUntil?: Incrementers
  scrapeNext?: ScrapeConfigInit
  scrapeEach?: ScrapeConfigInit | ScrapeConfigInit[]
}

export interface ConfigInit {
  input?: Input | Input[]
  scrape: ScrapeConfigInit
}

// returned by ./normalize.ts
export interface ScrapeConfig {
  name: ScraperName
  download?: DownloadConfig
  parse?: ParseConfig
  incrementUntil: Incrementers
  scrapeNext?: ScrapeConfig // scrape next only increments until 'empty-parse'
  scrapeEach: ScrapeConfig[]
}

export interface Config extends ConfigInit {
  input: Input[]
  scrape: ScrapeConfig
}

// returned by ./make-flat-config.ts
export type ConfigPositionInfo = {
  depth: number
  horizontalIndex: number
  name: ScraperName
  parentName?: ScraperName
}
export type FlatConfig = {
  [scraperName: string]: ConfigPositionInfo
}

type Import = string
export interface ScrapeConfigInit2 {
  download?: DownloadConfigInit
  parse?: ParseConfigInit
  incrementUntil?: Incrementers
}
export interface ScrapeConfig2 {
  download?: DownloadConfig
  parse?: ParseConfig
  incrementUntil: Incrementers
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
export interface ConfigInit2 {
  input?: Input | Input[]
  import?: Import | Import[]
  defs: { [scraperName: string]: ScrapeConfigInit }
  structure: StructureInit
}
export interface Config2 extends ConfigInit2 {
  input: Input[]
  import: Import[]
  structure: Structure
}

