import deviantartConfig from '../deviantart.config'

describe('deviantart config', () => {
  test('is properly typed', () => {
    expect(deviantartConfig).toBeConfigType()
  })

  // TODO
  // test('returns expected example output', () => {})
})
