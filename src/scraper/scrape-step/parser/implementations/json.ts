import { AbstractParser } from '../abstract'

export class Parser extends AbstractParser {
  public parse = (value: string) => [value]
}
