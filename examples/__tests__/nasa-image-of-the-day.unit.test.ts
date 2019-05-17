import * as nasaIotdConfig from '../nasa-image-of-the-day.config.json'
import { typecheckConfig } from '../../src/util/typechecking.runtime'

describe('nasa iotd config', () => {
  it('is properly typed', () => {
    typecheckConfig(nasaIotdConfig)
  })

  // it('returns expected example output', () => {})
})
