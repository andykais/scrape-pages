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
  regex_cleanup: Regex
|}
type Input = InputSimple | InputCleaned

// html or json parser
type Parse = {|
  selector: string, // html selector (e.g. '.someclass > span')
  attribute?: string, // html element attribute (e.g. src), if not specified w/ html, textContent is selected
  singular?: boolean, // defaults to false
  regex_cleanup?: Regex,
  expect?: ExpectedResults
|}

// toplevel url builder
type UrlBuilderBase = {|
  template?: string, // template for url, will be filled using variables available
  regex_cleanup?: Regex
  // increment: false // TODO reenable after fix with flow-runtime
|}
type UrlBuilderIncrement = {|
  ...UrlBuilderBase,
  increment: true,
  initial_index?: number, // defaults to 0
  increment_by?: number // defaults to 1
|}
// defaults to { template: '{parse}', expect: 'html' }
type UrlBuilder = false | UrlBuilderBase | UrlBuilderIncrement

// recursing parser
type ScrapeCriteriaUnNamed = {|
  parse: Parse,
  build_url?: UrlBuilder,
  scrape_each?: ScrapeCriteria
|}
type ScrapeCriteriaNamed = {|
  ...ScrapeCriteriaUnNamed,
  name: string
|}
// the reason for different types is so when an array of values is scraped, we have a key to distinguish them
type ScrapeCriteria =
  | ScrapeCriteriaUnNamed
  | ScrapeCriteriaNamed
  | Array<ScrapeCriteriaNamed>

export type Config = {|
  input?: Input | Array<Input>,
  scrape: {|
    name?: string,
    parse?: Parse,
    build_url: UrlBuilder,
    scrape_each: ScrapeCriteria
  |}
|}
