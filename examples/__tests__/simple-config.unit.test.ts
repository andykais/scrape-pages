import * as testingConfigs from '../../testing/resources/testing-configs'
import { typecheckConfig } from '../../src/util/typechecking.runtime'

describe('example simple config', () => {
  const simpleConfig = testingConfigs.SIMPLE_CONFIG

  it('is properly typed', () => {
    typecheckConfig(simpleConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
