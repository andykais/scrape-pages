import * as nasaIotdConfigJson from '../nasa-image-of-the-day.config.json'
import { typecheckConfig } from '../../src/util/typechecking.runtime'

// fixes webpack json import error https://github.com/webpack/webpack/issues/8504
const nasaIotdConfig = (nasaIotdConfigJson as any).default as typeof nasaIotdConfigJson

describe('nasa iotd config', () => {
  it('is properly typed', () => {
    typecheckConfig(nasaIotdConfig)
  })

  // it('returns expected example output', () => {})
})
