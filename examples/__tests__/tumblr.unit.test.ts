import tumblrConfig from '../tumblr.config.json'
import { assertConfigType } from '../../src/configuration/site-traversal'

describe('tumblr config', () => {
  it('is properly typed', () => {
    assertConfigType(tumblrConfig)
  })
})
