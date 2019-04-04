import * as tumblrConfigJson from '../tumblr.config.json'
import { assertConfigType } from '../../src/settings/config'

// fixes webpack json import error https://github.com/webpack/webpack/issues/8504
const tumblrConfig = (tumblrConfigJson as any).default as typeof tumblrConfigJson

describe('tumblr config', () => {
  it('is properly typed', () => {
    assertConfigType(tumblrConfig)
  })
})
