import * as path from 'path'
import * as bunyan from 'bunyan'
// import { createLogger, transports, format } from 'winston'
import { tap } from 'rxjs/operators'
// type imports
import { OptionsInit, FlatOptions } from '../settings/options/types'
import { ScraperName } from '../settings/config/types'
// import * as winston from 'winston'
import { ParsedValue } from '../scraper/scrape-step'

const serializers = {
  parsedValuesWithId: (values: ParsedValue[]) => values.map(v => v.parsedValue)
}
class Logger {
  public debug: typeof bunyan.prototype.debug
  public info: typeof bunyan.prototype.info
  public warn: typeof bunyan.prototype.warn
  public error: typeof bunyan.prototype.error
  private logger: bunyan
  private scrapers: { [scraperName: string]: bunyan }

  public constructor(options: OptionsInit, flatOptions: FlatOptions) {
    this.logger = bunyan.createLogger({
      name: 'root',
      level: options.logLevel || ('error' as 'error'),
      serializers,
      streams: options.logToFile
        ? [{ path: path.resolve(options.folder, options.logToFile) }]
        : [{ stream: process.stdout }]
    })
    this.scrapers = {}
    flatOptions.forEach((options, name) => {
      const logger = this.logger.child({ scraper: name })
      this.scrapers[name] = logger
    })
    this.debug = this.logger.debug.bind(this.logger)
    this.info = this.logger.info.bind(this.logger)
    this.warn = this.logger.warn.bind(this.logger)
    this.error = this.logger.error.bind(this.logger)
  }
  public tap = (name = 'TAP') => tap((...args: any[]) => this.logger.debug({ tap: name, ...args }))
  public scraper = (name: ScraperName) => this.scrapers[name]
}
export type LogLevel = bunyan.LogLevel
export { Logger }
