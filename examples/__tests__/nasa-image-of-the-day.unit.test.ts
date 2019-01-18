import nasaIotdConfig from '../nasa-image-of-the-day.config.json'
import { assertConfigType } from '../../src/settings/config'

describe('nasa iotd config', () => {
  it('is properly typed', () => {
    assertConfigType(nasaIotdConfig)
  })

  it('returns expected example output', () => {})
})
