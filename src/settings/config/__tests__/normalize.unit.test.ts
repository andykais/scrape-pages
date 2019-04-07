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
      scrapers: {
        index: {
          download: {
            protocol: 'http',
            method: 'GET',
            urlTemplate: simpleConfig.scrapers.index.download as string,
            headerTemplates: {},
            read: true,
            write: false,
            regexCleanup: undefined
          },
          parse: {
            selector: (simpleConfig.scrapers.index.parse as any).selector,
            attribute: (simpleConfig.scrapers.index.parse as any).attribute,
            format: 'html',
            regexCleanup: undefined
          },
          incrementUntil: 0
        },
        image: {
          download: {
            protocol: 'http',
            method: 'GET',
            urlTemplate: simpleConfig.scrapers.image.download as any,
            headerTemplates: {},
            read: true,
            write: false,
            regexCleanup: undefined
          },
          parse: undefined,
          incrementUntil: 0
        }
      },
      run: {
        scraper: 'index',
        forNext: [],
        forEach: [
          {
            scraper: 'image',
            forNext: [],
            forEach: []
          }
        ]
      }
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
        scrapers: { identity: {} },
        run: { scraper: 'identitiy' }
      }
      expect(() => normalizeConfig(config)).to.throw()
    })
    it('for scraper names should error out', () => {
      const config = {
        scrapers: { 'scraper+': {} },
        run: { scraper: 'identitiy' }
      }
      expect(() => normalizeConfig(config)).to.throw()
    })
  })

  describe('poorly formed config', () => {
    const configInit: any = {}
    it('should throw a type assertion error', () => {
      expect(() => normalizeConfig(configInit))
        .to.throw(`$: expected 'scrapers' in object`)
        .with.property('name', 'RuntimeTypeError')
    })
    describe('with scrapers that are not defined', () => {
      const configInit = { scrapers: {}, run: { scraper: 'hello' } }
      it('should throw an error', () => {
        expect(() => normalizeConfig(configInit)).to.throw(
          'config.scrapers is missing scraper "hello"'
        )
      })
    })
  })
})
