import { normalizeConfig } from '../'
import * as globalVals from '../../../../tests/setup'
import { ConfigInit } from '../types'

describe('filled in defaults', () => {
  describe('simple config', () => {
    const simpleConfig = globalVals.__SIMPLE_CONFIG__
    const fullConfig = normalizeConfig(simpleConfig)
    const fullConfigGuess: ConfigInit = {
      input: [],
      scrape: {
        name: 'level_0_index_0',
        download: {
          method: 'GET',
          urlTemplate: (simpleConfig.scrape as any).download,
          cookieTemplates: {},
          headerTemplates: {}
          // regexCleanup: undefined
        },
        parse: {
          ...(simpleConfig.scrape as any).parse,
          expect: 'html'
        },
        incrementUntil: 0,
        scrapeEach: [
          {
            name: 'level_1_index_0',
            download: {
              method: 'GET',
              urlTemplate: (simpleConfig.scrape as any).scrapeEach.download,
              cookieTemplates: {},
              headerTemplates: {}
            },
            parse: undefined,
            incrementUntil: 0,
            scrapeEach: [],
            scrapeNext: undefined
          }
        ],
        scrapeNext: undefined
      }
    }

    it('should match itself for a full filled in config', () => {
      const fullConfigFromGuess = normalizeConfig(fullConfigGuess)
      expect(fullConfigFromGuess).toStrictEqual(fullConfigGuess)
    })

    it('should match the guessed full config', () => {
      expect(fullConfig).toStrictEqual(fullConfigGuess)
    })
  })

  describe('gallery post img tag config', () => {
    const galleryPostImgTag = globalVals.__GALLERY_POST_IMG_TAG__
    const fullConfig = normalizeConfig(galleryPostImgTag)

    it('should match itself for a full filled in config', () => {
      const fullConfigFromGuess = normalizeConfig(fullConfig)
      expect(fullConfigFromGuess).toStrictEqual(fullConfig)
    })
  })
})
