import nasaIotdConfig from '../nasa-image-of-the-day.config.json'
import { assertConfigType } from '../../src/configuration/site-traversal'

describe('nasa iotd config', () => {
  test('is properly typed', () => {
    assertConfigType(nasaIotdConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
