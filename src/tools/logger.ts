import * as path from 'path'
import * as Bunyan from 'bunyan'
import { tap } from 'rxjs/operators'
import * as fs from '../util/fs'
// type imports
import { FMap } from '../util/map'
import { OptionsInit, FlatOptions } from '../settings/options/types'
import { ScraperName } from '../settings/config/types'
import { ParsedValue } from '../scraper/scrape-step'

const serializers = {
  parsedValuesWithId: (values: ParsedValue[]) => values.map(v => v.parsedValue)
}
class Logger {
  private static logFilename = 'run.log.0'
  public debug: Bunyan['debug']
  public info: Bunyan['info']
  public warn: Bunyan['warn']
  public error: Bunyan['error']
  private logger: Bunyan
  private scraperLoggers: FMap<ScraperName, Bunyan>

  public constructor(options: OptionsInit, flatOptions: FlatOptions) {
    this.logger = Bunyan.createLogger({
      name: 'root',
      level: options.logLevel || ('error' as 'error'),
      serializers,
      streams: [{ path: path.resolve(options.folder, Logger.logFilename) }]
    })
    this.scraperLoggers = flatOptions.map((options, name) => this.logger.child({ scraper: name }))

    this.debug = this.logger.debug.bind(this.logger)
    this.info = this.logger.info.bind(this.logger)
    this.warn = this.logger.warn.bind(this.logger)
    this.error = this.logger.error.bind(this.logger)
  }

  /**
   * Shifts the logfiles down ('run.log.0' -> 'run.log.1') so the newest log file can be 'run.log.0' without
   * overwriting anyone else. This only matters when reusing a download folder.
   */
  public static rotateLogFiles = async (folder: string, newLogFilename = Logger.logFilename) => {
    const oldLogFilename = newLogFilename.replace(/\d+$/, nStr => (parseInt(nStr) + 1).toString())
    const oldLog = path.resolve(folder, oldLogFilename)
    const newLog = path.resolve(folder, newLogFilename)
    if (await fs.exists(newLog)) {
      await Logger.rotateLogFiles(folder, oldLogFilename)
      await fs.rename(newLog, oldLog)
    }
  }

  public tap = (name = 'TAP') => tap((...args: any[]) => this.logger.debug({ tap: name, ...args }))
  public scraper = (name: ScraperName) => this.scraperLoggers.getOrThrow(name)
}

export type LogLevel = Bunyan.LogLevel
export { Logger }
