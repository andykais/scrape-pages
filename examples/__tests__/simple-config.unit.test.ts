import { assertConfigType } from '../../src/settings/config'
import * as testingConfigs from '../../testing/resources/testing-configs'

describe('example simple config', () => {
  const simpleConfig = testingConfigs.__SIMPLE_CONFIG__

  it('is properly typed', () => {
    assertConfigType(simpleConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
