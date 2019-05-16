import { JSONPath } from 'jsonpath-plus'
import { AbstractParser } from '../abstract'
// type imports
import { ParseConfigJson } from '../../../../settings/config/types'

export class Parser extends AbstractParser {
  public type: 'json' = 'json'
  protected parseConfig: ParseConfigJson

  public parse = (value: string) => {
    const object = JSON.parse(value)

    const result = JSONPath({
      path: this.parseConfig.selector
    })

    return Array.isArray(result)
      ? result.map(val => (typeof val === 'object' ? JSON.stringify(val) : val.toString()))
      : typeof result === 'object'
      ? [JSON.stringify(result)]
      : [result.toString()]
  }
}
