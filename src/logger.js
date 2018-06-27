import chalk from 'chalk'
import { tap } from 'rxjs/operators'

class Logger {
  level = {
    DEBUG: 3,
    WARN: 2,
    INFO: 1,
    ERRO: 0
  }

  allowed = {
    DEBUG: false,
    WARN: false,
    INFO: false,
    ERROR: false
  }

  colors = {
    DEBUG: chalk,
    WARN: chalk.yellow,
    INFO: chalk,
    ERRO: chalk.red
  }

  constructor({ log_level }) {
    for (const key of Object.keys(this.level)) {
      this.allowed[key] = this.level[key] <= log_level
    }
    this.log_level = log_level
  }

  _log = prefix => (...messages) => {
    if (this.allowed[prefix] === undefined || this.allowed[prefix]) {
      console.log(prefix, ...messages)
    }
  }

  debug = this._log('DEBUG')
  warning = this._log('WARN')
  info = console.log
  error = this._log('ERRO')
  tap = (name = 'TAP') => tap(this._log(name))
}

export default Logger
