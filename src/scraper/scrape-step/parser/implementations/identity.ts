import { AbstractParser, ParserValues } from '../abstract'

export class Parser extends AbstractParser {
  parse = (value?: string): ParserValues => [value]
}
