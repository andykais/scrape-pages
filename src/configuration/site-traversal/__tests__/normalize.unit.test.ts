import { normalizeConfig } from '../'
import * as testingConfigs from '../../../../testing/resources/testing-configs'
import { ConfigInit } from '../types'
import { expect } from 'chai'

describe('normalize config with', () => {
  describe('simple config', () => {
    const simpleConfig = testingConfigs.__SIMPLE_CONFIG__
    const fullConfig = normalizeConfig(simpleConfig)
    const fullConfigGuess: ConfigInit = {
      input: [],
      scrape: {
        name: 'level_0_index_0',
        download: {
          method: 'GET',
          urlTemplate: (simpleConfig.scrape as any).download,
          headerTemplates: {}
          // regexCleanup: undefined
        },
        parse: {
          selector: (simpleConfig.scrape.parse as any).selector,
          attribute: (simpleConfig.scrape.parse as any).attribute,
          expect: 'html'
        },
        incrementUntil: 0,
        scrapeEach: [
          {
            name: 'level_1_index_0',
            download: {
              method: 'GET',
              urlTemplate: (simpleConfig.scrape as any).scrapeEach.download,
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
      expect(fullConfigFromGuess).to.be.deep.equal(fullConfigGuess)
    })

    it('should match the guessed full config', () => {
      expect(fullConfig).to.be.deep.equal(fullConfigGuess)
    })
  })

  describe('gallery post img tag config', () => {
    const galleryPostImgTag = testingConfigs.__GALLERY_POST_IMG_TAG__
    const fullConfig = normalizeConfig(galleryPostImgTag)

    it('should match itself for a full filled in config', () => {
      const fullConfigFromGuess = normalizeConfig(fullConfig)
      expect(fullConfigFromGuess).to.be.deep.equal(fullConfig)
    })
  })
})
