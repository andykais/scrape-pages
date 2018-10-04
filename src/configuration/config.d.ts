// RegexCleanup {{{
interface RegexCleanup {
  selector: string
  replacer: string
}
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
export type UrlMethods = 'GET' | 'POST' | 'PUT' | 'DELETE'
export interface DownloadConfigInterface {
  method?: UrlMethods
  urlTemplate: UrlTemplate
  cookieTemplates?: { [CookieName: string]: string }
  headerTemplates?: { [HeaderName: string]: string }
  increment?: 'untilEmpty' | number
}
type DownloadConfig = UrlTemplate | DownloadConfigInterface
// }}}

// ParseConfig {{{
type ExpectedFormats = 'html' | 'json'
export interface ParseConfig {
  expect?: ExpectedFormats
  selector: string
  attribute?: string
}
// }}}

export interface ScrapeConfig {
  name?: string
  download?: DownloadConfig
  parse?: ParseConfig
  regexCleanup?: RegexCleanup
  scrapeEach?: ScrapeConfig | ScrapeConfig[]
}

export interface Config {
  input?: Input | Input[]
  scrape: ScrapeConfig
}

// returned by ./normalize.ts
export interface FullScrapeConfig extends ScrapeConfig {
  scrapeEach: FullScrapeConfig[]
}
export interface FullConfig extends Config {
  scrape: FullScrapeConfig
}

// returned by ./make-flat-config.ts
export interface FlatConfig {
  [string]: {
    depth: number
    horizontalIndex: number
    name: string
    parentName?: string
  }
}
