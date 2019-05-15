import * as tumblrConfig from '../tumblr.config.json'
import { typecheckConfig } from '../../src/util/typechecking.runtime'

describe(__filename, () => {
  it('is properly typed', () => {
    typecheckConfig(tumblrConfig)
  })
})
