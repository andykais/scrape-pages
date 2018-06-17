import fillInDefaults from '../fill-in-defaults'

describe('filled in defaults', () => {
  const simpleConfig = global.__SIMPLE_CONFIG__

  const fullConfigGuess = {
    input: undefined,
    scrape: {
      name: 'level_0_index_0',
      download: {
        increment: 0,
        initialIndex: 0,
        template: simpleConfig.scrape.download,
        regexCleanup: undefined
      },
      parse: {
        ...simpleConfig.scrape.parse,
        expect: 'html',
        regexCleanup: undefined
      },
      scrapeEach: [
        {
          name: 'level_1_index_0',
          download: {
            increment: 0,
            initialIndex: 0,
            template: simpleConfig.scrape.scrapeEach.download,
            regexCleanup: undefined
          },
          parse: undefined,
          scrapeEach: []
        }
      ]
    }
  }

  // TODO test that input matches output for defaults
  test('for a full filled in config should match itself', () => {
    const fullConfig = fillInDefaults(fullConfigGuess)
    expect(fullConfig).toStrictEqual(fullConfigGuess)
  })

  test('for simple config should match in expected full config', () => {
    const fullConfig = fillInDefaults(simpleConfig)
    expect(fullConfig).toStrictEqual(fullConfigGuess)
  })

  test('for simple config should adhere to configuration flow type', () => {
    const fullConfig = fillInDefaults(simpleConfig)
    expect(fullConfig).toBeConfigType()
  })

})
