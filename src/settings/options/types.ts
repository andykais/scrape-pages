import { FMap } from '../../util/map'
// until webpack can load ts-runtime, this is far more convienent than importing the type from '../config/types'
type ScraperName = string

// likewise, this should come from bunyan, but it does not work well with ts-runtime
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type Input = { [inputName: string]: string }

interface OptionsAnyInit {
  logLevel?: LogLevel
  cache?: boolean // should re-download or use db entry
}

export interface ScrapeOptionsInit extends OptionsAnyInit {
  downloadPriority?: number
}
export type ScrapeOptions = Readonly<Required<ScrapeOptionsInit>>

/** @public */
export interface OptionsInit extends OptionsAnyInit {
  maxConcurrent?: number
  rateLimit?: {
    rate: number // in milliseconds
    limit: number
  }
  optionsEach?: {
    [scraperName: string]: ScrapeOptionsInit
  }
}

export type FlatOptions = FMap<ScraperName, ScrapeOptions>
