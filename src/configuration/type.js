type RegexRemove = string
type RegexReplace = {
  select: string,
  replace?: string, // defaults to ''
  flags?: string // defaults to 'g'
}
type Regex = RegexRemove | RegexReplace

type ExpectedResults = 'html' | 'json' | 'scalar'

// User input
type InputSimple = string
type InputCleaned = {
  name: string,
  regex_cleanup: Regex
}
type Input = InputSimple | InputCleaned

// html or json parser
type Scrape = {
  selector: string, // html selector (e.g. '.someclass > span')
  attribute?: string, // html element attribute (e.g. src), if not specified w/ html, textContent is selected
  regex_cleanup?: Regex,
  expect?: ExpectedResults
}

// recursing parser
type ScrapeCriteria = {
  criteria: Scrape,
  for_each?: ScrapeCriteria
}

type NextUrlBase = {
  url_template: string,
  regex_cleanup?: Regex,
  expect?: ExpectedResults
}
type NextUrlIncrement = {
  ...NextUrlBase,
  increment: boolean, // defaults to false
  initial_index?: number, // defaults to 0
  increment_by?: number // defaults to 1
}

type NextUrl = NextUrlBase | NextUrlIncrement

export type Config = {
  input: Input | [Input],
  scrape: {
    build_url: NextUrl,
    for_each: ScrapeCriteria
  }
}
