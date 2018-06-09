import nasaIotdConfig from '../nasa-image-of-the-day.config'

describe('nasa iotd config', () => {
  test('is properly typed', () => {
    expect(nasaIotdConfig).toBeConfigType()
  })

  // TODO
  // test('returns expected example output', () => {})
})
