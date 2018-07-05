import chalk from 'chalk'
import { tap } from 'rxjs/operators'

class Logger {
  level = {
    DEBUG: 3,
    WRN: 2,
    CLI: 1,
    ERR: 0
  }

  allowed = {
    DEBUG: false,
    WRN: false,
    CLI: false,
    ERR: false
  }

  colors = {
    DEBUG: chalk,
    WRN: chalk.yellow,
    CLI: chalk,
    ERR: chalk.red
  }

  out = {
    DEBUG: console.log,
    WRN: console.log,
    CLI: console.log,
    ERR: console.error
  }

  constructor({ log_level }) {
    for (const key of Object.keys(this.level)) {
      this.allowed[key] = this.level[key] <= log_level
    }
    this.log_level = log_level
  }

  _log = prefix => (...messages) => {
    if (this.allowed[prefix]) {
      this.out[prefix](this.colors[prefix](prefix, ...messages))
    }
  }

  debug = this._log('DEBUG')
  warn = this._log('WRN')
  cli = console.log
  error = this._log('ERR')
  tap = (name = 'TAP') => tap(this._log(name))
}

export default Logger
