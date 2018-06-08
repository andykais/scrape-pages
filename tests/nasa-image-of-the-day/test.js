import nasaIotdConfig from './config'

describe('nasa iotd config', () => {
  test('is properly typed', () => {
    expect(nasaIotdConfig).toBeConfigType()
  })

  test('returns expected example output', () => {})
})
