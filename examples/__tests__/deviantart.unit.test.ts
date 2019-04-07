import * as deviantartConfigJson from '../deviantart.config.json'
import { typecheckConfig } from '../../src/util/typechecking.runtime'

// fixes webpack json import error https://github.com/webpack/webpack/issues/8504
const deviantartConfig = (deviantartConfigJson as any).default as typeof deviantartConfigJson

describe(__filename, () => {
  it('is properly typed', () => {
    typecheckConfig(deviantartConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
