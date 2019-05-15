import { AbstractParser } from '../abstract'

export class Parser extends AbstractParser {
  public type: 'json' = 'json'

  public parse = (value: string) => [value]
}
