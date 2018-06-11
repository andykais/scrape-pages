import tumblrConfig from '../tumblr.config'

describe('tumblr config', () => {
  test('is properly typed', () => {
    expect(tumblrConfig).toBeConfigType()
  })

  // TODO
  // test('returns expected example output', () => {})
})
