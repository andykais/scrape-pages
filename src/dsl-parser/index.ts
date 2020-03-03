import * as nearley from 'nearley'
import * as grammar from './grammar.ne'

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar.default))

function dslParser(input: string) {
  parser.feed(input)

  if (parser.results.length !== 1) {
    throw new Error('Grammar parsed incorrectly')
  } else {
    return parser.results[0]
  }
}

export { dslParser }
