import tumblrConfig from '../tumblr.config.json'
import { assertConfigType } from '../../src/configuration/site-traversal'

describe('tumblr config', () => {
  test('is properly typed', () => {
    assertConfigType(tumblrConfig)
  })
})
