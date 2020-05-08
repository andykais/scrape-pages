import { FunctionalTestSetup } from '@test/functional/setup'

const testEnv = new FunctionalTestSetup(__dirname)
const host = testEnv.mockHost

const simple = `
(
  FETCH '${host}/index.html' LABEL='index'
  PARSE 'li > a' ATTR='href'
  FETCH '${host}{{value}}'
  PARSE 'h1.article-title' LABEL='postTitle'
)
`

const merging = `
(
  FETCH '${host}/index.html' LABEL='index'
  PARSE 'li > a' ATTR='href'
).merge(
  (
    FETCH '${host}{{value}}'
    PARSE 'h1.article-title' LABEL='postTitle'
  ),
  (
    REPLACE 'http' LABEL='urls'
  )
)
`

export {
  simple,
  merging
}
