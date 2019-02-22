import { FMap } from '../../util/map'
// until webpack can load ts-runtime, this is far more convienent than importing the type from '../config/types'
type ScraperName = string

// likewise, this should come from bunyan, but it does not work well with ts-runtime
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type Input = { [inputName: string]: string }

interface OptionsAnyInit {
  logLevel?: LogLevel
  cache?: boolean // should re-download or use db entry
  read?: boolean // should download be read into memory
  write?: boolean // should download be saved to a file (separate from a database entry)
}

interface ScraperOptionsInit extends OptionsAnyInit {
  downloadPriority?: number
}
interface ScraperOptions extends Required<ScraperOptionsInit> {}

interface Parallelism {
  maxConcurrent?: number
  rateLimit?: {
    rate: number // in milliseconds
    limit: number
  }
}
export interface OptionsInit extends OptionsAnyInit, Parallelism {
  input?: Input
  folder: string
  cleanFolder?: boolean
  optionsEach?: {
    [scraperName: string]: ScraperOptionsInit
  }
}

export type OptionsReusable = Omit<OptionsInit, 'input' | 'folder' | 'cleanFolder'>

export interface Options extends ScraperOptions {
  input: Input
  folder: string
}
export type FlatOptions = FMap<ScraperName, Options>
