// type imports
import { ScraperName } from '../site-traversal/types'
import { LogType } from '../../logger'

export type Input = { [inputName: string]: number | string | boolean }

interface OptionsAny {
  cache?: boolean
}

interface ScraperOptionsInit extends OptionsAny {
  downloadPriority?: number
  logLevel?: LogType
}
interface ScraperOptions extends OptionsAny {
  cache: boolean
  downloadPriority: number
  logLevel: LogType
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
  logLevel?: LogType
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
