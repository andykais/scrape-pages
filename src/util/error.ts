import * as Rx from 'rxjs'
import VError from 'verror'

export const wrapError = (message: any) => (e: Error) =>
  Rx.throwError(new VError({ name: e.name, cause: e }, message))
