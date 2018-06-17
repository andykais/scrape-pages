type RequestOptions = {
  headers: {}, // these will be merged with the internal picked headers
  cookies: {}
}

// limiters matching the named scrapers in your config
type Limiters = {
  [string]: number
}

type Options = {
  folder: string, // folder that all downloads will go to
  cache?: boolean, // defaults to true
  request?: RequestOptions, // params passed down to the request module downloading the data
  limit?: number | Array<Limiters>
}

export type Options = {
  optionsAll?: Options,
  optionsNamed?: {
    [string]: Options
  }
}
