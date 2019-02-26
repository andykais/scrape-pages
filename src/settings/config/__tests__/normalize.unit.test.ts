import { normalizeConfig } from '../'
import * as testingConfigs from '../../../../testing/resources/testing-configs'
import { Config } from '../types'
import { expect } from 'chai'

describe('normalize config with', () => {
  describe('simple config', () => {
    const simpleConfig = testingConfigs.SIMPLE_CONFIG
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
          incrementUntil: 0,
          limitValuesTo: undefined
        },
        image: {
          download: {
            method: 'GET',
            urlTemplate: simpleConfig.defs.image.download as any,
            headerTemplates: {}
          },
          parse: undefined,
          incrementUntil: 0,
          limitValuesTo: undefined
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
    const galleryPostImgTag = testingConfigs.GALLERY_POST_IMG_TAG
    const fullConfig = normalizeConfig(galleryPostImgTag)

    it('should match itself for a full filled in config', () => {
      const fullConfigFromGuess = normalizeConfig(fullConfig)
      expect(fullConfigFromGuess).to.be.deep.equal(fullConfig)
    })
  })

  describe('poorly formed slugs', () => {
    it('for input names should error out', () => {
      const config = {
        input: ['test+'],
        defs: { identity: {} },
        structure: { scraper: 'identitiy' }
      }
      expect(() => normalizeConfig(config)).to.throw()
    })
    it('for scraper names should error out', () => {
      const config = {
        defs: { 'scraper+': {} },
        structure: { scraper: 'identitiy' }
      }
      expect(() => normalizeConfig(config)).to.throw()
    })
  })

  describe('poorly formed config', () => {
    const configInit: any = {}
    it('should throw a type assertion error', () => {
      expect(() => normalizeConfig(configInit))
        .to.throw(TypeError)
        .with.property('name', 'RuntimeTypeError')
    })
  })
})
