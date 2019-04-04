import { AbstractParser } from '../abstract'

export class Parser extends AbstractParser {
  public type = 'json' as 'json'

  public parse = (value: string) => [value]
}
