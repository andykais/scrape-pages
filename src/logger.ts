import { tap } from 'rxjs/operators'
// type imports
import { ParsedValue } from './scraper/scrape-step'

const logLevelConstants = {
  DEBUG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0
}
type LogConstantsType = typeof logLevelConstants
export type LogType = keyof LogConstantsType

export type LogOptions = {
  logScrapers?: string[]
  logLevel?: LogType
  logFile?: string
}

class ScraperLogger {
  private name: string
  private isPermitted: boolean

  private logIfPermitted = <T extends Function>(func: T) => {
    type FunctionArguments = ArgumentTypes<typeof func>
    return (...args: FunctionArguments) => {
      if (this.isPermitted) {
        console.log(`scraper "${this.name}":`, ...func(...args))
      }
    }
  }
  public constructor(name: string, isPermitted: boolean) {
    Object.assign(this, { name, isPermitted })
  }
  public cachedValues = this.logIfPermitted(
    (downloadId: number, parsedValuesWithId: ParsedValue[]) => [
      `id:${downloadId} retrieved values`,
      parsedValuesWithId.map(v => v.parsedValue)
    ]
  )
  public newValues = this.logIfPermitted(
    (downloadId: number, parsedValuesWithId: ParsedValue[]) => [
      `id:${downloadId} inserted values`,
      parsedValuesWithId.map(v => v.parsedValue)
    ]
  )
}

class Logger {
  private permittedLogLevel: LogType
  private permittedScrapers: string[]

  public debug: (...args: any[]) => void
  public info: (...args: any[]) => void
  public warn: (...args: any[]) => void
  public error: (...args: any[]) => void
  public tap: (...args: any[]) => void

  public constructor({
    logLevel = 'ERROR',
    logScrapers = [],
    logFile
  }: LogOptions = {}) {
    this.permittedScrapers = logScrapers
    this.permittedLogLevel = logLevel
    // setup loggers
    this.debug = this.isPermitted('DEBUG') ? this._log('DEBUG') : () => {}
    this.info = this.isPermitted('INFO') ? this._log() : () => {}
    this.warn = this.isPermitted('WARN') ? this._log('WARN') : () => {}
    this.error = this.isPermitted('ERROR')
      ? this._log('ERRO', console.error)
      : () => {}
    this.tap = this.isPermitted('DEBUG')
      ? (name = 'TAP') => tap(this._log(name))
      : () => tap
  }
  private isPermitted = (logLevel: LogType): boolean =>
    logLevelConstants[logLevel] <= logLevelConstants[this.permittedLogLevel]

  private _log = (prefix?: string, logger = console.log) =>
    prefix
      ? (...messages: any[]) => {
          logger(prefix, ...messages)
        }
      : (...messages: any[]) => {
          logger(...messages)
        }

  public scraper = (name: string) => {
    const scraperIsPermitted = this.permittedScrapers.includes(name)
    return new ScraperLogger(name, scraperIsPermitted)
  }
}

export { Logger }
