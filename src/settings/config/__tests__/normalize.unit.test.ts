import { normalizeConfig } from '../'
import * as testingConfigs from '../../../../testing/resources/testing-configs'
import { Config } from '../types'
import { expect } from 'chai'

describe('normalize config with', () => {
  describe('simple config', () => {
    const simpleConfig = testingConfigs.__SIMPLE_CONFIG__
    const fullConfig = normalizeConfig(simpleConfig)
    const fullConfigGuess: Config = {
      input: [],
      import: [],
      defs: {
        index: {
          download: {
            method: 'GET',
            urlTemplate: simpleConfig.defs.index.download as any,
            headerTemplates: {}
          },
          parse: {
            selector: (simpleConfig.defs.index.parse as any).selector,
            attribute: (simpleConfig.defs.index.parse as any).attribute,
            expect: 'html'
          },
          incrementUntil: 0
        },
        image: {
          download: {
            method: 'GET',
            urlTemplate: simpleConfig.defs.image.download as any,
            headerTemplates: {}
          },
          parse: undefined,
          incrementUntil: 0
        }
      },
      structure: {
        scraper: 'index',
        scrapeNext: [],
        scrapeEach: [
          {
            scraper: 'image',
            scrapeNext: [],
            scrapeEach: []
          }
        ]
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
