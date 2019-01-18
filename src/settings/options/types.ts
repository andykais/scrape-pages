// type imports
import { ScraperName } from '../config/types'
import { LogLevel } from '../../tools/logger'

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

export interface RunOptionsInit extends OptionsAny, Parallelism {
  input?: Input
  folder: string
  cleanFolder?: boolean
  logLevel?: LogLevel
  logToFile?: string
  optionsEach?: {
    [scraperName: string]: ScraperOptionsInit
  }
}

export interface RunOptions extends ScraperOptions {
  input: Input
  folder: string
}

export type FlatRunOptions = Map<ScraperName, RunOptions>
