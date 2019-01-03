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

  private log = (...messages: any[]) => {
    console.log(`scraper "${this.name}:"`, ...messages)
  }
  private assignIfPermitted = <T extends Function>(func: T) => {
    if (this.isPermitted) {
      type FunctionArguments = ArgumentTypes<typeof func>
      return (...args: FunctionArguments) => {
        func(...args)
      }
    } else {
      return () => {}
    }
  }
  public constructor(name: string, isPermitted: boolean) {
    Object.assign(this, { name, isPermitted })
    this.cachedValues = this.assignIfPermitted(this.cachedValues)
    this.newValues = this.assignIfPermitted(this.newValues)
  }
  public cachedValues = (
    downloadId: number,
    parsedValuesWithId: ParsedValue[]
  ) =>
    this.log(
      `id:${downloadId} retrieved values`,
      parsedValuesWithId.map(v => v.parsedValue)
    )
  public newValues = (downloadId: number, parsedValuesWithId: ParsedValue[]) =>
    this.log(
      `id:${downloadId} inserted values`,
      parsedValuesWithId.map(v => v.parsedValue)
    )
}

class Logger {
  private permittedLogLevel: LogType
  private permittedScrapers: string[]
  private logFile?: string

  private isPermitted = (logLevel: LogType): boolean =>
    logLevelConstants[logLevel] <= logLevelConstants[this.permittedLogLevel]
  private assignIfPermitted = <T extends Function>(
    logger: T,
    logType: LogType
  ) => (this.isPermitted(logType) ? logger : () => {})

  // TODO handle logFile outputs
  private output = (prefix: string) => (...args: any[]) => {
    console.log(prefix, ...args)
  }

  public constructor({
    logLevel = 'ERROR',
    logScrapers = [],
    logFile
  }: LogOptions = {}) {
    this.permittedScrapers = logScrapers
    this.permittedLogLevel = logLevel
    this.logFile = logFile
    // setup loggers
    this.debug = this.assignIfPermitted(this.debug, 'DEBUG')
    this.info = this.assignIfPermitted(this.info, 'INFO')
    this.warn = this.assignIfPermitted(this.warn, 'WARN')
    this.error = this.assignIfPermitted(this.error, 'ERROR')
    this.tap = this.isPermitted('DEBUG') ? this.tap : () => tap()
  }
  public debug = this.output('DEBUG')
  public info = this.output('INFO')
  public warn = this.output('WARN')
  public error = console.error
  public tap = (name = 'TAP') => tap(this.output(name))

  public scraper = (name: string) => {
    const scraperIsPermitted = this.permittedScrapers.includes(name)
    return new ScraperLogger(name, scraperIsPermitted)
  }
}

export { Logger }
