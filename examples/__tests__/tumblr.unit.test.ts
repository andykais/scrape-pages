import * as tumblrConfigJson from '../tumblr.config.json'
import { typecheckConfig } from '../../src/util/typechecking.runtime'

// fixes webpack json import error https://github.com/webpack/webpack/issues/8504
const tumblrConfig = (tumblrConfigJson as any).default as typeof tumblrConfigJson

describe(__filename, () => {
  it('is properly typed', () => {
    typecheckConfig(tumblrConfig)
  })
})
