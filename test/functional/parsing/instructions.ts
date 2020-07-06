import { FunctionalTestSetup } from '@test/functional/setup'

const testEnv = new FunctionalTestSetup(__dirname)
const host = testEnv.mockHost

const simple = `
(
  FETCH '${host}/api-response.json'
  PARSE 'posts[type="post"].content' FORMAT='json'
  REPLACE '\\n$' LABEL='post'
)
`

const parseJsonTwice = `
(
  FETCH '${host}/api-response.json'
  PARSE 'posts[type="post"]' FORMAT='json'
  PARSE 'content' FORMAT='json'
  REPLACE '\\n$' LABEL='post'
)
`

const jsonInsideScript = `
(
  FETCH '${host}/json-inside-js-response.js'
  REPLACE '.*var api_read = (.*);.*' WITH='$1' FLAGS='s'
  PARSE 'a.nested.story[].word' FORMAT='json' LABEL='words'
)
`

const parseMultilineTextAsSingleLines = `
INPUT 'packageName'
(
  FETCH '${host}/multiline-text-body.html'
  PARSE 'pre' FORMAT='html'
  PARSE '\\n' FORMAT='delimiter' TRIM=true LABEL='lines'
).filter('"{{ value }}"' == '"{{ packageName }}"').map(
  FETCH '${host}/success.json'
  PARSE 'success' FORMAT='json'  LABEL='api-success'
)
`

export { simple, parseJsonTwice, jsonInsideScript, parseMultilineTextAsSingleLines }
