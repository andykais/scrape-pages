// RegexCleanup {{{
type RegexRemove = string
interface RegexReplace {
  selector: string
  replacer: string
}
type RegexCleanup = RegexRemove | RegexReplace
// }}}

// Input {{{
type InputSimple = string
type InputCleaned = {
  name: string
  regexCleanup: RegexCleanup
}
type Input = InputSimple | InputCleaned
// }}}

// DownloadConfig {{{
type UrlTemplate = string
type UrlMethods = 'GET' | 'POST' | 'PUT' | 'DELETE'
interface DownloadConfigInterface {
  method?: UrlMethods
  urlTemplate: UrlTemplate
  headerTemplates?: { [HeaderName: string]: string }
  regexCleanup?: RegexCleanup
}
export type DownloadConfigInit = UrlTemplate | DownloadConfigInterface
export interface DownloadConfig extends DownloadConfigInterface {
  method: UrlMethods
  headerTemplates: { [HeaderName: string]: string }
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
  name?: string
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
  name: string
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
  name: string
  parentName?: string
}
export type FlatConfig = {
  [name: string]: ConfigPositionInfo
}
