import { FMap } from '../../util/map'
// scraper name
export type ScraperName = string
// scraper group
type ScraperGroup = string
// input key
type InputKey = string

// RegexCleanup {{{
type RegexRemove = string
interface RegexReplaceInit {
  selector: string
  replacer: string
  flags?: string
}
export type RegexCleanupInit = RegexRemove | RegexReplaceInit
export interface RegexCleanup extends RegexReplaceInit {
  flags: string
}
// }}}

// Input {{{
type Input = InputKey
// }}}

// DownloadConfig {{{
// handlebars template
type AcceptedProtocols = 'http'
type Template = string
type UrlMethods = 'GET' | 'POST' | 'PUT' | 'DELETE'
interface DownloadConfigInterface {
  protocol?: AcceptedProtocols
  method?: UrlMethods
  urlTemplate: Template
  headerTemplates?: { [headerName: string]: Template }
  regexCleanup?: RegexCleanupInit | undefined
  read?: boolean // should download be read into memory
  write?: boolean // should download be saved to a file (separate from a database entry)
}
export type DownloadConfigInit = Template | DownloadConfigInterface | undefined
export interface DownloadConfig extends DownloadConfigInterface {
  protocol: AcceptedProtocols
  method: UrlMethods
  headerTemplates: { [headerName: string]: Template }
  read: boolean
  write: boolean
  regexCleanup: RegexCleanup | undefined
}
// }}}

// ParseConfig {{{
type AcceptedFormats = 'html' | 'xml' | 'json'
type Selector = string
interface ParseConfigInterface {
  format?: AcceptedFormats
  selector: Selector
  attribute?: string
  limit?: number
  regexCleanup?: RegexCleanupInit | undefined
}
export type ParseConfigInit = Selector | ParseConfigInterface | undefined
export interface ParseConfig extends ParseConfigInterface {
  format: AcceptedFormats
  regexCleanup: RegexCleanup | undefined
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
export interface Structure extends StructureInit {
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
