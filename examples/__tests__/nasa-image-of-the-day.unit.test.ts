import * as nasaIotdConfigJson from '../nasa-image-of-the-day.config.json'
import { assertConfigType } from '../../src/settings/config'

// fixes webpack json import error https://github.com/webpack/webpack/issues/8504
const nasaIotdConfig = (nasaIotdConfigJson as any).default as typeof nasaIotdConfigJson

describe('nasa iotd config', () => {
  it('is properly typed', () => {
    assertConfigType(nasaIotdConfig)
  })

  it('returns expected example output', () => {})
})
