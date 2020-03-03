import { dslParser } from '../'

import { inspect } from 'util'

const instructions = `
INPUT 'hi'
(

  GET 'https://google.com' WRITE=true

  GET 'https://wikipedia.com' WRITE=true READ=true
  PARSE 'span > a' ATTR='href' MAX=10
  TAG 'test'
)
.until('{{value}}' == 'x')
.map(
  TAG 'nother'

#.until('true' == 'true' || ('true' == 'true' || 1 < 2))
#.until('true' == 'true' || 'true' == 'true')
).branch(
(
  GET 'me'
  GET 'me'
).map(
  GET 'you'
),
(
 TAG 'ne'
)
)
`

describe(__filename, () => {
  it('basic', () => {
    const out = dslParser(instructions)
    console.log(inspect(out, { depth: null, colors: true }))
    // console.log(JSON.stringify(out, null, 2))
  })
})
