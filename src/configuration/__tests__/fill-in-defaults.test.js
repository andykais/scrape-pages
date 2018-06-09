import fillInDefaults from '../fill-in-defaults'

describe('fill in defaults', () => {
  const simpleConfig = global.__SIMPLE_CONFIG__

  test('output should adhere to configuration flow type', () => {
    const fullConfig = fillInDefaults(simpleConfig)
    expect(fullConfig).toBeConfigType()
  })

  test('should fill in defaults on simple config', () => {
    const fullConfig = fillInDefaults(simpleConfig)
    expect(fullConfig).toStrictEqual({
      input: undefined,
      scrape: {
        parse: undefined,
        build_url: {
          template: simpleConfig.scrape.build_url.template,
          increment: false,
          expect: 'html',
          regex_cleanup: undefined
        },
        scrape_each: {
          parse: {
            selector: 'img',
            attribute: 'src',
            regex_cleanup: undefined,
            singular: false
          },
          build_url: {
            increment: false,
            expect: 'html',
            regex_cleanup: undefined
          },
          scrape_each: undefined
        }
      }
    })
  })
})
