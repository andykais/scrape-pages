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
interface ParseConfigInitInterface {
  limit?: number
  regexCleanup?: RegexCleanupInit | undefined
}
interface ParseConfigHtmlInterface extends ParseConfigInitInterface {
  format?: 'html'
  selector: Selector
  attribute?: string
}
interface ParseConfigXmlInterface extends ParseConfigInitInterface {
  format: 'xml'
  selector: Selector
  attribute?: string
}
interface ParseConfigJsonInterface extends ParseConfigInitInterface {
  format: 'json'
  selector: Selector
}
// a string value will normalize to ParseConfigHtmlInterface
export type ParseConfigInit =
  | Selector
  | ParseConfigHtmlInterface
  | ParseConfigXmlInterface
  | ParseConfigJsonInterface
  | undefined

export interface ParseConfigInterface extends ParseConfigInitInterface {
  regexCleanup: RegexCleanup | undefined
}
export type ParseConfigXml = ParseConfigXmlInterface & ParseConfigInterface
export type ParseConfigHtml = ParseConfigHtmlInterface & ParseConfigInterface
export type ParseConfigJson = ParseConfigJsonInterface & ParseConfigInterface
export type ParseConfig = ParseConfigHtml | ParseConfigXml | ParseConfigJson
// }}}

type Incrementers = 'failed-download' | 'empty-parse' | number

// returned by ./flatten.ts
export type ConfigPositionInfo = {
  depth: number
  horizontalIndex: number
  name: ScraperName
  parentName?: ScraperName
  configAtPosition: FlowStep
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
// export interface ConfigInit {
//   input?: Input | Input[]
//   scrapers: { [scraperName: string]: ScrapeConfigInit }
//   run: StructureInit
// }
// // returned by ./normalize.ts
// export interface Config extends ConfigInit {
//   input: Input[]
//   scrapers: { [scraperName: string]: ScrapeConfig }
//   run: Structure
// }

interface ScraperInit {
  name: string
  download?: DownloadConfigInit
  parse?: ParseConfigInit
  incrementUntil?: Incrementers
}
interface Scraper {
  name: string
  download?: DownloadConfig
  parse?: ParseConfig
  incrementUntil: Incrementers
}

interface FlowInitStep {
  scrape: ScraperInit
  recurse?: FlowInitStepOrScraper[][]
  branch?: FlowInitStepOrScraper[][]
}
type FlowInitStepOrScraper = FlowInitStep | ScraperInit

interface ConfigInit {
  input?: string[]
  flow: FlowInitStepOrScraper[]
}

// the ScrapeInit gets put into branch
interface FlowStep {
  scrape: Scraper
  branch: FlowStep[][]
  recurse: FlowStep[][]
}
interface Config {
  input: string[]
  flow: FlowStep[]
}

export { ScraperInit, Scraper, FlowInitStep, FlowInitStepOrScraper, FlowStep, ConfigInit, Config }

/**
 * WHY are we looking to io-ts?
 *
 * no transformers needed
 * wrap normalize & validate into one module
 */

/**
 * WHY change the config structure?
 *
 * scraper defintions dont need to be decoupled, use in-code variables for that
 *  * maybe once reusable modules are a thing this will be revisted, but until then it dont matter
 * we flatten the structure, its nice and more clear, like brads language idea (-_- )
 */
