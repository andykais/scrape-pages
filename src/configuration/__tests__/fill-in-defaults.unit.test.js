import { fillInDefaults } from '../'

describe('filled in defaults', () => {
  describe('simple config', () => {
    const simpleConfig = global.__SIMPLE_CONFIG__
    const fullConfig = fillInDefaults(simpleConfig)
    const fullConfigGuess = {
      input: [],
      scrape: {
        name: 'level_0_index_0',
        download: {
          increment: 0,
          initialIndex: 0,
          incrementUntil: undefined,
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
              incrementUntil: undefined,
              template: simpleConfig.scrape.scrapeEach.download,
              regexCleanup: undefined
            },
            parse: undefined,
            scrapeEach: []
          }
        ]
      }
    }

    it('should match itself for a full filled in config', () => {
      const fullConfigFromGuess = fillInDefaults(fullConfigGuess)
      expect(fullConfigFromGuess).toStrictEqual(fullConfigGuess)
    })

    it('should match the guessed full config', () => {
      expect(fullConfig).toStrictEqual(fullConfigGuess)
    })

    it('filled in version should adhere to configuration flow type', () => {
      expect(fullConfig).toBeConfigType()
    })
  })

  describe('gallery post img tag config', () => {
    const galleryPostImgTag = global.__GALLERY_POST_IMG_TAG__
    const fullConfig = fillInDefaults(galleryPostImgTag)

    it('should match configuration flow type', () => {
      expect(fullConfig).toBeConfigType()
    })
    it('should match itself for a full filled in config', () => {
      const fullConfigFromGuess = fillInDefaults(fullConfig)
      expect(fullConfigFromGuess).toStrictEqual(fullConfig)
    })
  })
})
