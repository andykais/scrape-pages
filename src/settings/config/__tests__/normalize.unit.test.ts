import { normalizeConfig } from '../'
import * as testingConfigs from '../../../../testing/resources/testing-configs'
import { Config } from '../types'
import { expect } from 'chai'

describe(__filename, () => {
  describe('simple config', () => {
    const simpleConfig = testingConfigs.SIMPLE_CONFIG
    const fullConfig = normalizeConfig(simpleConfig)
    const fullConfigGuess: Config = {
      input: [],
      flow: [
        {
          scrape: {
            name: 'index',
            download: {
              protocol: 'http',
              method: 'GET',
              urlTemplate: (simpleConfig.flow[0] as any).download,
              // urlTemplate: simpleConfig.scrapers.index.download as string,
              headerTemplates: {},
              read: true,
              write: false,
              regexCleanup: undefined
            },
            parse: {
              selector: (simpleConfig.flow[0] as any).parse.selector,
              attribute: (simpleConfig.flow[0] as any).parse.attribute,
              format: 'html',
              regexCleanup: undefined
            },
            incrementUntil: 0
          },
          branch: [],
          recurse: []
        },
        {
          scrape: {
            name: 'image',
            download: {
              protocol: 'http',
              method: 'GET',
              urlTemplate: (simpleConfig.flow[1] as any).download,
              headerTemplates: {},
              read: true,
              write: false,
              regexCleanup: undefined
            },
            parse: undefined,
            incrementUntil: 0
          },
          branch: [],
          recurse: []
        }
      ]
    }

    it('should match the guessed full config', () => {
      expect(fullConfig).to.deep.equal(fullConfigGuess)
    })

    it('should match itself for a full filled in config', () => {
      const fullConfigFromGuess = normalizeConfig(fullConfigGuess)
      expect(fullConfigFromGuess).to.deep.equal(fullConfigGuess)
    })
  })

  describe('gallery post img tag config', () => {
    const galleryPostImgTag = testingConfigs.GALLERY_POST_IMG_TAG
    const fullConfig = normalizeConfig(galleryPostImgTag)

    it('should match itself for a full filled in config', () => {
      const fullConfigFromGuess = normalizeConfig(fullConfig)
      expect(fullConfigFromGuess).to.deep.equal(fullConfig)
    })
  })

  describe('poorly formed slugs', () => {
    it('for input names should error out', () => {
      const config = {
        input: ['test+'],
        flow: []
      }
      expect(() => normalizeConfig(config)).to.throw()
    })
    it('for scraper names should error out', () => {
      const config = {
        flow: [{ name: 'scraper+' }]
      }
      expect(() => normalizeConfig(config)).to.throw(
        'For a scraper name: "scraper+" is not valid. Allowed characters are /^[a-zA-Z-_]*$/'
      )
    })
  })

  describe('poorly formed config', () => {
    const configInit: any = {}
    it('should throw a type assertion error', () => {
      expect(() => normalizeConfig(configInit))
        .to.throw(`$: expected 'flow' in object`)
        .with.property('name', 'TypeGuardError')
    })
  })
})
