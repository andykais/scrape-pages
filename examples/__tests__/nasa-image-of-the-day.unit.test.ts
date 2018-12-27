import nasaIotdConfig from '../nasa-image-of-the-day.config.json'
import { assertConfigType } from '../../src/configuration/site-traversal'

describe('nasa iotd config', () => {
  it('is properly typed', () => {
    assertConfigType(nasaIotdConfig)
  })

  it('returns expected example output', () => {})
})
