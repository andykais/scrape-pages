import { normalizeConfig } from '../'
import { assertConfigType } from '../assert-config-type'

describe('filled in defaults', () => {
  describe('simple config', () => {
    const simpleConfig = global.__SIMPLE_CONFIG__
    const fullConfig = normalizeConfig(simpleConfig)
    const fullConfigGuess = {
      input: [],
      scrape: {
        name: 'level_0_index_0',
        download: {
          method: 'GET',
          urlTemplate: simpleConfig.scrape.download,
          cookieTemplates: {},
          headerTemplates: {},
          increment: 0,
          initialIndex: 0,
          incrementUntil: undefined
          // regexCleanup: undefined
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
              method: 'GET',
              urlTemplate: simpleConfig.scrape.scrapeEach.download,
              cookieTemplates: {},
              headerTemplates: {},
              increment: 0,
              initialIndex: 0,
              incrementUntil: undefined
              // regexCleanup: undefined
            },
            parse: undefined,
            scrapeEach: []
          }
        ]
      }
    }

    it('should match itself for a full filled in config', () => {
      const fullConfigFromGuess = normalizeConfig(fullConfigGuess)
      expect(fullConfigFromGuess).toStrictEqual(fullConfigGuess)
    })

    it('should match the guessed full config', () => {
      expect(fullConfig).toStrictEqual(fullConfigGuess)
    })

    it('filled in version should adhere to configuration flow type', () => {
      assertConfigType(fullConfig)
    })
  })

  describe('gallery post img tag config', () => {
    const galleryPostImgTag = global.__GALLERY_POST_IMG_TAG__
    const fullConfig = normalizeConfig(galleryPostImgTag)

    it('should match configuration flow type', () => {
      assertConfigType(fullConfig)
    })
    it('should match itself for a full filled in config', () => {
      const fullConfigFromGuess = normalizeConfig(fullConfig)
      expect(fullConfigFromGuess).toStrictEqual(fullConfig)
    })
  })
})
