import tumblrConfig from '../tumblr.config.json'
import { assertConfigType } from '../../src/settings/config'

describe('tumblr config', () => {
  it('is properly typed', () => {
    assertConfigType(tumblrConfig)
  })
})
