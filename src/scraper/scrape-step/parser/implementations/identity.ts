import { AbstractParser, ParserValues } from '../abstract'

export class Parser extends AbstractParser {
  public type = 'identity' as 'identity'

  public parse = (value: string): ParserValues => [value]
}
