import tumblrConfig from './config'

describe('tumblr config', () => {
  test('is properly typed', () => {
    expect(tumblrConfig).toBeConfigType()
  })

  test('returns expected example output', () => {})
})
