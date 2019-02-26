import { FMap } from '../../../util/map'
import { normalizeConfig } from '../../config'
import { normalizeOptions } from '../'
import * as testingConfigs from '../../../../testing/resources/testing-configs'
import { OptionsInit, FlatOptions } from '../types'
import { expect } from 'chai'

describe('normalize run options with', () => {
  describe('simple config', () => {
    const fullConfig = normalizeConfig(testingConfigs.SIMPLE_CONFIG)
    it('should match returned options', () => {
      const optionsInit: OptionsInit = {}
      const options = normalizeOptions(fullConfig, optionsInit)
      const optionsExpected: FlatOptions = FMap.fromObject({
        index: {
          cache: true,
          read: true,
          write: false,
          logLevel: 'error' as 'error',
          downloadPriority: 0
        },
        image: {
          cache: true,
          read: true,
          write: false,
          logLevel: 'error' as 'error',
          downloadPriority: 0
        }
      })
      expect([...options]).to.have.deep.members([...optionsExpected])
    })
  })
})
