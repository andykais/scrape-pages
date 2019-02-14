import { FMap } from '../../../util/map'
import { normalizeConfig } from '../../config'
import { normalizeOptions } from '../'
import * as testingConfigs from '../../../../testing/resources/testing-configs'
import { FlatOptions } from '../types'
import { expect } from 'chai'

describe('normalize run options with', () => {
  describe('simple config', () => {
    const fullConfig = normalizeConfig(testingConfigs.__SIMPLE_CONFIG__)
    it('should match returned options', () => {
      const optionsInit = {
        folder: '/nonexistent'
      }
      const options = normalizeOptions(fullConfig, optionsInit)
      const optionsExpected: FlatOptions = FMap.fromObject({
        index: {
          cache: true,
          read: true,
          write: false,
          logLevel: 'error' as 'error',
          downloadPriority: 0,
          folder: '/nonexistent/index',
          input: {}
        },
        image: {
          cache: true,
          read: true,
          write: false,
          logLevel: 'error' as 'error',
          downloadPriority: 0,
          folder: '/nonexistent/image',
          input: {}
        }
      })
      expect([...options]).to.have.deep.members([...optionsExpected])
    })
  })

  describe('config with input', () => {
    const fullConfig = normalizeConfig(testingConfigs.__INPUT_CONFIG__)

    it('should error out when there is no input', () => {
      const optionsInit = { folder: '/nonexistent' }
      const missingInputs = fullConfig.input.join()

      expect(() => normalizeOptions(fullConfig, optionsInit)).to.throw(
        `Invalid input! Options is missing keys(s) [${missingInputs}]`
      )
    })

    it('should not error out when there are extra run option inputs', () => {
      const optionsInit = {
        input: { username: 'johnnybravo', password: 'sunglasses' },
        folder: '/nonexistent'
      }
      const options = normalizeOptions(fullConfig, optionsInit)
      const normalizedInput = options.get('identity')!.input

      expect(normalizedInput).to.be.deep.equal({
        username: optionsInit.input.username
      })
    })
  })
})
