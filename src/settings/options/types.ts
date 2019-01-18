// until webpack can load ts-runtime, this is far more convienent than importing other files
type ScraperName = string
// likewise, this should come from bunyan, but it does not work well with ts-runtime
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type Input = { [inputName: string]: number | string | boolean }

interface OptionsAny {
  cache?: boolean
}

interface ScraperOptionsInit extends OptionsAny {
  downloadPriority?: number
  logLevel?: LogLevel
}
interface ScraperOptions extends OptionsAny {
  cache: boolean
  downloadPriority: number
  logLevel: LogLevel
}

export interface Parallelism {
  maxConcurrent?: number
  rateLimit?: {
    rate: number
    limit: number
  }
}

export interface OptionsInit extends OptionsAny, Parallelism {
  input?: Input
  folder: string
  cleanFolder?: boolean
  logLevel?: LogLevel
  logToFile?: string
  optionsEach?: {
    [scraperName: string]: ScraperOptionsInit
  }
}

export interface Options extends ScraperOptions {
  input: Input
  folder: string
}

export type FlatOptions = Map<ScraperName, Options>
