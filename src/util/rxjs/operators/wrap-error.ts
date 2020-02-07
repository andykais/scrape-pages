import * as Rx from 'rxjs'
import { VError } from 'verror'

export const wrapError = (message: string) => (e: Error) =>
  Rx.throwError(new VError({ name: e.name, cause: e }, message))
