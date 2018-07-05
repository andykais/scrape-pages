type RequestOptions = {
  headers: {}, // these will be merged with the internal picked headers
  cookies: {}
}

// limiters matching the named scrapers in your config
type Limiters = {
  [string]: number
}

type OptionsAny = {|
  cache?: boolean, // defaults to true
  request?: RequestOptions, // params passed down to the request module downloading the data
  limit?: number,
  return?: boolean, // defaults to true
  returnParsed?: boolean, // defaults to true if leaf node and no download step
  returnDownloaded?: boolean, // defaults to true if leaf node
  folder?: string
|}

// defaults only occur in optionsAll, and optionsAll options will be overridden by optionsNamed
export type OptionsAll = {|
  ...OptionsAny,
  folder: string
|}
export type OptionsNamed = OptionsAny

export type Options = {|
  folder: string, // folder that downloads will go to
  optionsAll?: OptionsAny,
  optionsNamed?: {
    [string]: {|
      ...OptionsAny,
      folder?: string
    |}
  }
|}
