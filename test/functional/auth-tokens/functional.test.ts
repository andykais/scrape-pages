import nock from 'nock'
import { FunctionalTestSetup, assertQueryResultPartial } from '@test/functional/setup'

import { ScraperProgram } from '@scrape-pages'

const testEnv = new FunctionalTestSetup(__dirname, { initNock: false })

describe(__filename, () => {
  beforeEach(testEnv.beforeEach)
  afterEach(() => {
    nock.cleanAll()
  })

  it('should set an auth token on the header', async () => {
    const authToken = 'aslkdfliuxcreejtnekjerr'
    const scope = nock('http://auth-tokens')
    scope
      .post('/login', { username: 'alice', password: 'abc' })
      .reply(200, { auth_token: authToken })
    scope
      .get('/users/alice')
      .matchHeader('http-x-auth-token', authToken)
      .reply(200, { birthday: '12/24/1990', name: 'Alice' })
    scope
      .get('/users/alice/likes')
      .matchHeader('http-x-auth-token', authToken)
      .reply(200, { likes: ['post-a', 'post-b'] })

    const instructions = `
    (
      FETCH 'http://auth-tokens/login' METHOD='POST' BODY={"username": "alice", "password": "abc"}
      PARSE 'auth_token' FORMAT='json'
      SET 'token'
      FETCH 'http://auth-tokens/users/alice' HEADERS={"http-x-auth-token": "{{ token }}"}
      FETCH 'http://auth-tokens/users/alice/likes' HEADERS={"http-x-auth-token": "{{ token }}"}
      PARSE 'likes' LABEL='likes' FORMAT='json'
    )
    `
    const options = {}
    const scraper = new ScraperProgram(instructions, testEnv.outputFolder, options)
    await scraper.start().toPromise()

    const result = scraper.query(['likes'])
    assertQueryResultPartial(result, [
      {
        likes: [{ value: 'post-a' }, { value: 'post-b' }],
      },
    ])
  })
})
