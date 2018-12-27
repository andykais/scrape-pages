import { assertConfigType } from '../../src/configuration/site-traversal'
import * as globalVals from '../../tests/setup'

describe('simple config', () => {
  const simpleConfig = globalVals.__SIMPLE_CONFIG__

  it('is properly typed', () => {
    assertConfigType(simpleConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
