import { assertConfigType } from '../../src/configuration'
describe('simple config', () => {
  const simpleConfig = global.__SIMPLE_CONFIG__

  test('is properly typed', () => {
    assertConfigType(simpleConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
