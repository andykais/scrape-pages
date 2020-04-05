import { FunctionalTestSetup } from '@test/functional/setup'

const testEnv = new FunctionalTestSetup(__dirname)
const host = testEnv.mockHost

const simple = `
(
  FETCH '${host}/index.html' LABEL='index'
).reduce(
  PARSE '#batch-id' LABEL='parse-batch-id'
  FETCH '${host}/partial-page/id-{{ value }}.html' LABEL='fetch-partial'
).map(
  PARSE 'li > a' ATTR='href' LABEL='post'
  FETCH '${host}{{value}}' LABEL='post-fetch'
).merge(
  (
    PARSE 'h2' LABEL='title'
  ),
  (
    PARSE 'img' ATTR='src' LABEL='image-parse'
    FETCH '${host}{{ value }}' READ=false WRITE=true LABEL='image'
  )
)
`

// there are two more images in the index.html file. Lets grab those
const merging = `
(
  FETCH '${host}/index.html' LABEL='index'
).merge(
  (),
  ().reduce(
    PARSE '#batch-id' LABEL='parse-batch-id'
    FETCH '${host}/partial-page/id-{{ value }}.html' LABEL='fetch-partial'
  )
).map(
  PARSE 'li > a' ATTR='href' LABEL='post'
  FETCH '${host}{{value}}' LABEL='post-fetch'
).merge(
  (
    PARSE 'h2' LABEL='title'
  ),
  (
    PARSE 'img' ATTR='src' LABEL='image-parse'
    FETCH '${host}{{ value }}' READ=false WRITE=true LABEL='image'
  )
)
`

export { simple, merging }
