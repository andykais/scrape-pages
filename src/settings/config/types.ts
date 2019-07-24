import { FMap } from '../../util/map'
/** scraper name @public */
export type ScraperName = string
// scraper group
type ScraperGroup = string
// input key
type InputKey = string

// RegexCleanup {{{
/** @public */
export type RegexRemove = string
/** @public */
export interface RegexReplaceInit {
  selector: string
  replacer: string
  flags?: string
}
/** @public */
export type RegexCleanupInit = RegexRemove | RegexReplaceInit
/** @public */
export interface RegexCleanup extends RegexReplaceInit {
  flags: string
}
// }}}

// Input {{{
/** @public */
export type Input = InputKey
// }}}

// DownloadConfig {{{
// handlebars template
type AcceptedProtocols = 'http'
/** @public */
export type Template = string
/** @public */
export type UrlMethods = 'GET' | 'POST' | 'PUT' | 'DELETE'
/** @public */
export interface DownloadConfigInterface {
  protocol?: AcceptedProtocols
  method?: UrlMethods
  urlTemplate: Template
  headerTemplates?: { [headerName: string]: Template }
  regexCleanup?: RegexCleanupInit | undefined
  read?: boolean // should download be read into memory
  write?: boolean // should download be saved to a file (separate from a database entry)
}
/** @public */
export type DownloadConfigInit = Template | DownloadConfigInterface | undefined
/** @public */
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
/** @public */
export type AcceptedFormats = 'html' | 'xml' | 'json'
/** @public */
export type Selector = string
/** @public */
export interface ParseConfigInitInterface {
  limit?: number
  regexCleanup?: RegexCleanupInit | undefined
}
/** @public */
export interface ParseConfigHtmlInterface extends ParseConfigInitInterface {
  format?: 'html'
  selector: Selector
  attribute?: string
}
/** @public */
export interface ParseConfigXmlInterface extends ParseConfigInitInterface {
  format: 'xml'
  selector: Selector
  attribute?: string
}
/** @public */
export interface ParseConfigJsonInterface extends ParseConfigInitInterface {
  format: 'json'
  selector: Selector
}
// a string value will normalize to ParseConfigHtmlInterface
/** @public */
export type ParseConfigInit =
  | Selector
  | ParseConfigHtmlInterface
  | ParseConfigXmlInterface
  | ParseConfigJsonInterface
  | undefined

/** @public */
export interface ParseConfigInterface extends ParseConfigInitInterface {
  regexCleanup: RegexCleanup | undefined
}
/** @public */
export type ParseConfigXml = ParseConfigXmlInterface & ParseConfigInterface
/** @public */
export type ParseConfigHtml = ParseConfigHtmlInterface & ParseConfigInterface
/** @public */
export type ParseConfigJson = ParseConfigJsonInterface & ParseConfigInterface
/** @public */
export type ParseConfig = ParseConfigHtml | ParseConfigXml | ParseConfigJson
// }}}

/** @public */
export type Incrementers = 'failed-download' | 'empty-parse' | number

// returned by ./flatten.ts
/** @public */
export type ConfigPositionInfo = {
  depth: number
  horizontalIndex: number
  name: ScraperName
  parentName?: ScraperName
}
/** @public */
export type FlatConfig = FMap<ScraperName, ConfigPositionInfo>

/** @public */
export interface ScrapeConfigInit {
  download?: DownloadConfigInit
  parse?: ParseConfigInit
  incrementUntil?: Incrementers
}
/** @public */
export interface ScrapeConfig {
  download?: DownloadConfig
  parse?: ParseConfig
  incrementUntil: Incrementers
}
/** @public */
export interface StructureInit {
  scraper: ScraperName
  forEach?: StructureInit | StructureInit[]
  forNext?: StructureInit | StructureInit[]
}
/** @public */
export interface Structure extends StructureInit {
  forEach: Structure[]
  forNext: Structure[]
}
/**
 * @public
 *
 * request definitions and data flow descibed via a recursive structure
 */
export interface ConfigInit {
  /** Optional field which specifies which inputs are required when calling `start()` */
  input?: Input | Input[]
  /** Defines reusable scrapers consumed by the run portion of the config. */
  scrapers: { [scraperName: string]: ScrapeConfigInit }
  /** One way data flow that describes how to scrape a site. */
  run: StructureInit
}
/** @public */
export interface Config extends ConfigInit {
  input: Input[]
  scrapers: { [scraperName: string]: ScrapeConfig }
  run: Structure
}
