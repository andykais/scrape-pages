type Input = { [inputName: string]: number | string | boolean }

interface OptionsAny {
  cache?: boolean
}
// options for each scraper
interface ScraperOptions extends OptionsAny {
  // useLimiter?: boolean
}

export interface Parallelism {
  maxConcurrent?: number
  rateLimit?: {
    rate: number
    limit: number
  }
}

export interface RunOptionsInit extends OptionsAny, Parallelism {
  input?: Input
  folder: string
  optionsEach?: {
    [name: string]: ScraperOptions
  }
}

export interface RunOptions extends OptionsAny, Parallelism, ScraperOptions {
  input: Input
  folder: string
}

export type FlatRunOptions = {
  [name: string]: RunOptions
}
