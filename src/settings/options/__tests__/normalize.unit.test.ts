import { FMap } from '../../../util/map'
import { normalizeConfig } from '../../config'
import { normalizeOptions } from '../'
import * as testingConfigs from '../../../../testing/resources/testing-configs'
import { OptionsInit, ScrapeOptions, FlatOptions } from '../types'
import { expect } from 'chai'

describe(__filename, () => {
  describe('simple config', () => {
    const fullConfig = normalizeConfig(testingConfigs.SIMPLE_CONFIG)
    it('should match returned options', () => {
      const optionsInit: OptionsInit = {}
      const options = normalizeOptions(fullConfig, optionsInit)
      const optionsExpected: FlatOptions = FMap.fromObject<ScrapeOptions>({
        index: {
          cache: false,
          logLevel: 'error' as 'error',
          downloadPriority: 0
        },
        image: {
          cache: false,
          logLevel: 'error' as 'error',
          downloadPriority: 0
        }
      })
      expect([...options]).to.have.deep.members([...optionsExpected])
    })
  })
  describe('poorly formed options', () => {
    const optionsInit: any = { maxConcurrent: '1' }
    const fullConfig = normalizeConfig(testingConfigs.EMPTY_CONFIG)
    it('should throw a type assertion error', () => {
      expect(() => normalizeOptions(fullConfig, optionsInit))
        .to.throw('$.maxConcurrent: expected a number')
        .with.property('name', 'RuntimeTypeError')
    })
  })
})
