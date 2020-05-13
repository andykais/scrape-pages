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

const cachePost = `
(
  FETCH '${host}/index.html' LABEL='index'
  PARSE 'li > a' ATTR='href'
  FETCH '${host}{{value}}' CACHE=true
  PARSE 'h1.article-title' LABEL='postTitle'
)
`

export { simple, cachePost }
