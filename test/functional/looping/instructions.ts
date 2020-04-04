import { FunctionalTestSetup } from '@test/functional/setup'

const testEnv = new FunctionalTestSetup(__dirname)
const host = testEnv.mockHost

// if you want the loop to happen per each input, put it in a branch!
// it might be difficult to say "loop 5 times and ignore request failures"
const simple = `
().loop(
  FETCH '${host}/gallery/page/{{"+" index 1}}.html' LABEL='gallery-get'
).until('{{ index }}' == 2).map(
  PARSE 'li > a' ATTR='href' LABEL='gallery'
  FETCH '${host}{{ value }}' LABEL='post'
).branch(
  (
    PARSE '#tags > li' LABEL='tag'
  ),
  (
    PARSE 'img' ATTR='src'
    FETCH '${host}{{ value }}' READ=false WRITE=true LABEL='image'
  )
)
`
const merging = `
().loop(
  FETCH '${host}/gallery/page/{{"+" index 1}}.html' LABEL='gallery-get'
).until('{{ index }}' == 2)
.branch(
  (
    PARSE 'img' ATTR='src'
  ),
  (
    PARSE 'li > a' ATTR='href' LABEL='gallery'
    FETCH '${host}{{ value }}' LABEL='post'
    PARSE 'img' ATTR='src'
  )
).branch(
  (
    FETCH '${host}{{ value }}' READ=false WRITE=true LABEL='image'
  )
)
`
const withEmptyValue = `
().loop(
  FETCH '${host}/gallery/page/{{"+" index 1}}.html' LABEL='gallery-get'
).until('{{ index }}' == 2).map(
  PARSE 'li > a' ATTR='href' LABEL='gallery'
  FETCH '${host}{{ value }}' LABEL='post'
).branch(
  (
    PARSE '#tags > li' LABEL='tag'
  ),
  (
    PARSE 'img' ATTR='src' LABEL='image-parse'
    FETCH '${host}{{ value }}' READ=false WRITE=true LABEL='image'
    PARSE 'nothing' LABEL='never-reached'
  )
)
`

export { simple, merging, withEmptyValue }
