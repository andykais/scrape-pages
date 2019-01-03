import { AbstractParser } from '../abstract'

export class Parser extends AbstractParser {
  parse = (value: string) => [value]
}
