import * as Rx from 'rxjs'
import { Instructions } from './instructions'
import { Options } from './options'

interface Settings {
  instructions: Instructions
  options: Options
}

interface Tools {

}

type Value = string
// TODO find out if we are passing ids around. I think we still are
interface StoredValue {
  value: string
  id: number
}
type RxOperation = Rx.UnaryFunction<Rx.Observable<StoredValue>, Rx.Observable<StoredValue>>
// type RxOperation = Rx.UnaryFunction<StoredValue, StoredValue>

export { Settings, Tools, RxOperation, StoredValue, Value }
