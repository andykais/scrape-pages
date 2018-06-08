type RegexReplace = {
  select: string,
  replace: string
}

type ExpectedResults = 'html' | 'json' | 'scalar'

type Scrape = {
  selector: string, // html selector (e.g. '.someclass > span')
  attribute?: string, // html element attribute (e.g. src)
  regex_cleanup?: RegexReplace,
  expect?: ExpectedResults
}

type UrlCriteria = Scrape

type ScrapeCriteria = {
  criteria: Scrape,
  for_each?: ScrapeCriteria
}

type IncrementNextUrl = {
  type: 'increment',
  build_url: string,
  increment_by?: number, // defaults to 1
  inital_value?: number, // defaults to 0
  regex_cleanup?: RegexReplace,
  expect?: ExpectedResults // defaults to "html
}

type PaginationNextUrl = {
  type: 'pagination',
  url_criteria: UrlCriteria, // should return single value
  regex_cleanup?: RegexReplace,
  expect?: ExpectedResults
}

type NextUrl = IncrementNextUrl | PaginationNextUrl

export type Config = {
  input: string | [string],
  next_url: NextUrl,
  scrape_criteria: ScrapeCriteria
}
