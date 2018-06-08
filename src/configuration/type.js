type RegexRemove = string
type RegexReplace = {|
  select: string,
  replace?: string, // defaults to ''
  flags?: string // defaults to 'g'
|}
type Regex = RegexRemove | RegexReplace

// 'html' and 'json' are got from a url that is scraped, a scalar is a final value
type ExpectedResults = 'html' | 'json' | 'scalar'

// User input
type InputSimple = string
type InputCleaned = {|
  name: string,
  regex_cleanup: Regex
|}
type Input = InputSimple | InputCleaned

// html or json parser
type Scrape = {|
  selector: string, // html selector (e.g. '.someclass > span')
  attribute?: string, // html element attribute (e.g. src), if not specified w/ html, textContent is selected
  singular?: boolean, // defaults to false
  regex_cleanup?: Regex,
  expect_url_for_download?: boolean // defaults to true
|}

// recursing parser
type ScrapeCriteriaUnNamed = {|
  criteria: Scrape,
  expect?: ExpectedResults,
  for_each?: ScrapeCriteria
|}
type ScrapeCriteriaNamed = {|
  ...ScrapeCriteriaUnNamed,
  name: string
|}
// the reason for different types is so when an array of values is scraped, we have a key to distinguish them
type ScrapeCriteria = ScrapeCriteriaUnNamed | Array<ScrapeCriteriaNamed>

// toplevel url builder
type NextUrlBase = {|
  url_template: string,
  regex_cleanup?: Regex
|}
type NextUrlIncrement = {|
  ...NextUrlBase,
  increment: boolean, // defaults to false
  initial_index?: number, // defaults to 0
  increment_by?: number // defaults to 1
|}

type NextUrl = NextUrlBase | NextUrlIncrement

export type Config = {|
  input: Input | Array<Input>,
  scrape: {|
    build_url: NextUrl,
    expect?: ExpectedResults,
    for_each: ScrapeCriteria
  |}
|}
