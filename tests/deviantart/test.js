import deviantartConfig from './config'

describe('deviantart config', () => {
  test('is properly typed', () => {
    expect(deviantartConfig).toBeConfigType()
  })

  test('returns expected example output', () => {})
})
