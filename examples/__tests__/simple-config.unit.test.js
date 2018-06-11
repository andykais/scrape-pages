describe('simple config', () => {
  const simpleConfig = global.__SIMPLE_CONFIG__

  test('is properly typed', () => {
    expect(simpleConfig).toBeConfigType()
  })

  // TODO
  // test('returns expected example output', () => {})
})
