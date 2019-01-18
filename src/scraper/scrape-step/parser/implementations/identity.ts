import { AbstractParser, ParserValues } from '../abstract'

export class Parser extends AbstractParser {
  public parse = (value?: string): ParserValues => [value]
}
