// @flow

type RegexRemove = string
type RegexReplace = {|
  select: string,
  replace?: string, // defaults to ''
  flags?: string // defaults to 'g'
|}
type Regex = RegexRemove | RegexReplace

// 'html' and 'json' are got from a url that is scraped, a scalar is a final value
type ExpectedResults =
  | 'html' // html is the default, use it when there is an html parse step afterwords
  | 'json' // use this when there is a json parse step afterwords
  | 'binary' // use this when the result is definitely binary. No parse step may come after this
  | 'final' // mainly internal use, this lets the parsers know if there are no more child parsers

// User input
// special keyword _parse will be passed to parser initially
type InputSimple = string
type InputCleaned = {|
  name: string,
  regexCleanup: Regex
|}
type Input = InputSimple | InputCleaned

// html or json parser
type ParseDetailed = {|
  selector: string, // html selector (e.g. '.someclass > span')
  attribute?: string, // html element attribute (e.g. src), if not specified w/ html, textContent is selected
  regexCleanup?: Regex,
  expect?: ExpectedResults
|}
type ParseSelectorOnly = string
type Parse = ParseSelectorOnly | ParseDetailed

// toplevel url builder
// TODO put cookies and headers in here as templates
type UrlBuilderBase = {|
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE',
  urlTemplate: string,
  cookieTemplates?: { [string]: string },
  headerTemplates?: { [string]: string },
  regexCleanup?: Regex
  // increment?: 0
  // increment: false // TODO reenable after fix with flow-runtime
|}
type UrlBuilderIncrement = {|
  ...UrlBuilderBase,
  increment: number,
  initialIndex?: number,
  incrementUntil?: number
|}
type UrlBuilderTemplateOnly = string
// defaults to { urlTemplate: '{parse}', expect: 'html' }
// when undefined, identity is used
type UrlBuilder = UrlBuilderTemplateOnly | UrlBuilderBase | UrlBuilderIncrement

type ParserName = string
// recursing parser
// TODO handle the cases where there is no parser,
type ScrapeCriteriaBase = {|
  name?: ParserName,
  download?: UrlBuilder,
  parse?: Parse
|}
type ScrapeCriteriaLooper = {|
  ...ScrapeCriteriaBase,
  loopBackTo?: ParserName // this specifies which parser to return to with the current value, it cannot have children
|}
type ScrapeCriteriaWithChildren = {|
  ...ScrapeCriteriaBase,
  scrapeEach: ScrapeCriteria
|}
type ScrapeCriteriaOptions =
  | ScrapeCriteriaBase
  | ScrapeCriteriaLooper
  | ScrapeCriteriaWithChildren

type ScrapeCriteria = ScrapeCriteriaOptions | Array<ScrapeCriteriaOptions>

export type Config = {|
  input?: Input | Array<Input>,
  scrape: ScrapeCriteria
|}
