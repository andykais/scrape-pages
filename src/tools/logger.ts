import * as bunyan from 'bunyan'
// import { createLogger, transports, format } from 'winston'
import { tap } from 'rxjs/operators'
// type imports
import {
  RunOptionsInit,
  FlatRunOptions
} from '../settings/options/types'
import { ScraperName } from '../settings/config/types'
// import * as winston from 'winston'
import { ParsedValue } from '../scraper/scrape-step'

// TODO add serializers for parsedValueWithId
class Logger {
  private logger: bunyan
  private scrapers: Map<ScraperName, bunyan>

  public constructor(
    runOptions: RunOptionsInit,
    flatRunOptions: FlatRunOptions
  ) {
    this.logger = bunyan.createLogger({
      name: 'root',
      level: runOptions.logLevel || ('error' as 'error')
    })
    this.scrapers = new Map()
    flatRunOptions.forEach((options, name) => {
      const logger = this.logger.child({ scraper: name })
      this.scrapers.set(name, logger)
    })
  }
  public debug = (...args: any[]) => {}
  public info = (...args: any[]) => {}
  public warn = (...args: any[]) => {}
  public error = (...args: any[]) => {}
  public tap = (name = 'TAP') => (...args: any[]) => {}
  public scraper = (name: ScraperName) => this.scrapers.get(name)
}
export { Logger }

// type Transport =
//   | transports.FileTransportInstance
//   | transports.ConsoleTransportInstance

// const levels = {
//   DEBUG: 3,
//   INFO: 2,
//   WARN: 1,
//   ERROR: 0
// }
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

type LogConstantsType = typeof levels
export type LogType = keyof LogConstantsType

// are these all debug events?
// maybe not, debug should be for checking internal programming things
// you could be checking whether you have the correct scraper logic
// > scraper 'gallery' downloaded example.com/gallery.html
//   scraper 'gallery' parsed ['a', 'b', 'c']
// class ScraperLogger {
//   private logger: winston.Logger
//   public constructor(
//     name: string,
//     transport: Transport,
//     logLevel: string = 'error'
//   ) {
//     this.logger = createLogger({
//       level: logLevel,
//       transports: [transport],
//       format: format.combine(
//         format.label({ label: name }),
//         format.printf(info => `scraper ${info.label} ${info.message}`)
//       )
//     })
//     this.cachedValues = this.assignIfVerboseEnabled(this.cachedValues)
//     this.newValues = this.assignIfVerboseEnabled(this.newValues)
//     this.logger.levels
//   }
//   private isEnabled = (level: number): boolean =>
//     !!this.logger.levels[this.logger.level] &&
//     level >= this.logger.levels[this.logger.level]

//   private assignIfVerboseEnabled = <T extends Function>(func: T) => {
//     if (this.isEnabled(levels.verbose)) {
//       type FunctionArguments = ArgumentTypes<typeof func>
//       return (...args: FunctionArguments) => {
//         func(...args)
//       }
//     } else {
//       return () => {}
//     }
//   }
//   public cachedValues = (
//     downloadId: number,
//     parsedValuesWithId: ParsedValue[]
//   ) => {
//     this.logger.info(
//       `id:${downloadId} retrieved values`,
//       parsedValuesWithId.map(v => v.parsedValue)
//     )
//   }
//   public newValues = (
//     downloadId: number,
//     parsedValuesWithId: ParsedValue[]
//   ) => {
//     this.logger.info(
//       `id:${downloadId} inserted values`,
//       parsedValuesWithId.map(v => v.parsedValue)
//     )
//   }
// }

// class Logger {
//   private logger: winston.Logger
//   private scraperLoggers: Map<ScraperName, ScraperLogger>
//   public constructor(
//     { logLevel, logToFile }: RunOptionsInit,
//     flatRunOptions: FlatRunOptions
//   ) {
//     const transport = logToFile
//       ? new transports.File({ filename: logToFile })
//       : new transports.Console()
//     this.logger = createLogger({
//       levels,
//       level: logLevel,
//       transports: [transport]
//     })
//     this.scraperLoggers = new Map()
//     flatRunOptions.forEach((options, name) => {
//       this.scraperLoggers.set(
//         name,
//         new ScraperLogger(name, transport, logLevel)
//       )
//     })
//     this.debug = this.logger.debug.bind(this.logger)
//     this.info = this.logger.info.bind(this.logger)
//     this.warn = this.logger.warn.bind(this.logger)
//     this.error = this.logger.error.bind(this.logger)

//     // this.logLevel = logLevel ? levels[logLevel] : levels.ERROR
//     // // this.permittedScrapers = logScrapers
//     // this.logFile = logToFile
//     // setup loggers
//     // this.debug = this.assignIfPermitted(this.debug, levels.DEBUG)
//     // this.info = this.assignIfPermitted(this.info, levels.INFO)
//     // this.warn = this.assignIfPermitted(this.warn, levels.WARN)
//     // this.error = this.assignIfPermitted(this.error, levels.ERROR)
//     // this.tap = this.isPermitted(levels.DEBUG) ? this.tap : () => tap()
//   }
//   // public tap = (name = 'TAP') =>

//   private logLevel: number
//   // private permittedScrapers: string[]
//   private logFile?: string

//   private isPermitted = (logLevel: number): boolean => logLevel <= this.logLevel
//   private assignIfPermitted = <T extends Function>(
//     logger: T,
//     logLevel: number
//   ) => (this.isPermitted(logLevel) ? logger : () => {})

//   // TODO handle logFile outputs
//   private output = (prefix: string) => (...args: any[]) => {
//     /* eslint-disable-next-line no-console */
//     console.log(prefix, ...args)
//   }

//   public debug = this.output('DEBUG')
//   public info = this.output('INFO')
//   public warn = this.output('WARN')
//   public error = this.output('ERROR')
//   public tap = (name = 'TAP') => tap(this.output(name))

//   public scraper = (name: string) => {
//     // const scraperIsPermitted = this.permittedScrapers.includes(name)
//     return new ScraperLogger(name, new transports.Console())
//   }
// }

// export { Logger }
