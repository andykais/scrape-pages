import { assertConfigType } from '../../src/settings/config'
import * as testingConfigs from '../../testing/resources/testing-configs'

describe('example simple config', () => {
  const simpleConfig = testingConfigs.SIMPLE_CONFIG

  it('is properly typed', () => {
    assertConfigType(simpleConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
