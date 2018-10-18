import { tap } from 'rxjs/operators'

const logLevelConstants = {
  DEBUG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0
}
type LogConstantsType = typeof logLevelConstants
export type LogType = keyof LogConstantsType

class Logger {
  permittedLogLevel: LogType

  debug: (...args: any[]) => void
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  tap: (...args: any[]) => void

  constructor({ logLevel }: { logLevel: LogType }) {
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

  isPermitted = (logLevel: LogType): boolean =>
    logLevelConstants[logLevel] <= logLevelConstants[this.permittedLogLevel]

  _log = (prefix?: string, logger = console.log) =>
    prefix
      ? (...messages: any[]) => {
          logger(prefix, ...messages)
        }
      : (...messages: any[]) => {
          logger(...messages)
        }
}

export default Logger
