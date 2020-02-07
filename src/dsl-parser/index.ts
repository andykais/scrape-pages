import * as nearley from 'nearley'
import * as grammar from './grammar.ne'

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar.default))

function dslParser(input: string) {
  const result = parser.feed(input)

  return result
}

export {
  dslParser
}
