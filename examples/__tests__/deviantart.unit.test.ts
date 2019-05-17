import * as deviantartConfig from '../deviantart.config.json'
import { typecheckConfig } from '../../src/util/typechecking.runtime'

describe(__filename, () => {
  it('is properly typed', () => {
    typecheckConfig(deviantartConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
