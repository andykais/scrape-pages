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
// url builder with possible instructions to `increment` itself
type UrlTemplate = string
type UrlMethods = 'GET' | 'POST' | 'PUT' | 'DELETE'
interface DownloadConfigInterface {
  method?: UrlMethods
  urlTemplate: UrlTemplate
  cookieTemplates?: { [CookieName: string]: string }
  headerTemplates?: { [HeaderName: string]: string }
  incrementUntil?: 'empty' | number
}
export type DownloadConfigInit = UrlTemplate | DownloadConfigInterface
export interface DownloadConfig extends DownloadConfigInterface {
  method: UrlMethods
  incrementUntil: 'empty' | number
}
// }}}

// ParseConfig {{{
type ExpectedFormats = 'html' | 'json'
type Selector = string
interface ParseConfigInterface {
  expect?: ExpectedFormats
  selector: Selector
  attribute?: string
}
export type ParseConfigInit = Selector | ParseConfigInterface
export interface ParseConfig extends ParseConfigInterface {
  expect: ExpectedFormats
}
// }}}

export interface ScrapeConfigInit {
  name?: string
  download?: DownloadConfigInit
  parse?: ParseConfigInit
  regexCleanup?: RegexCleanup
  scrapeEach?: ScrapeConfigInit | ScrapeConfigInit[]
}

export interface ConfigInit {
  input?: Input | Input[]
  scrape: ScrapeConfigInit
}

// returned by ./normalize.ts
export interface ScrapeConfig extends ScrapeConfigInit {
  name: string
  download?: DownloadConfig
  parse?: ParseConfig
  scrapeEach: ScrapeConfig[]
}
export interface Config extends ConfigInit {
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
