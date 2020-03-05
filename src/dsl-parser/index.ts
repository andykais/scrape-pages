import * as nearley from 'nearley'
import * as grammar from './grammar.ne'
import { postProcess } from './post-process'
// type imports
import { Instructions } from '../types/instructions'

function dslParser(input: string): Instructions {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar.default))
  parser.feed(input)
  const results = parser.finish()

  if (results.length !== 1) {
    throw new Error('Grammar parsed ambiguously')
  } else {
    const [ast] = results
    return postProcess(ast)
  }
}

export { dslParser }
