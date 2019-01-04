import { normalizeConfig } from '../../site-traversal'
import { normalizeOptions } from '../'
import * as testingConfigs from '../../../../testing/resources/testing-configs'
import { FlatRunOptions } from '../types'
import { expect } from 'chai'

describe('normalize run options with', () => {
  describe('simple config', () => {
    const fullConfig = normalizeConfig(testingConfigs.__SIMPLE_CONFIG__)
    it('should match returned run options', () => {
      const runOptionsInit = {
        folder: '/nonexistent'
      }
      const runOptions = normalizeOptions(fullConfig, runOptionsInit)
      const runOptionsExpected: FlatRunOptions = {
        level_0_index_0: {
          cache: true,
          downloadPriority: 0,
          folder: '/nonexistent/level_0_index_0',
          input: {}
        },
        level_1_index_0: {
          cache: true,
          downloadPriority: 0,
          folder: '/nonexistent/level_1_index_0',
          input: {}
        }
      }
      expect(runOptionsExpected).to.be.deep.equal(runOptions)
    })
  })

  describe('config with input', () => {
    const fullConfig = normalizeConfig(testingConfigs.__INPUT_CONFIG__)

    it('should error out when there is no input', () => {
      const runOptionsInit = { folder: '/nonexistent' }
      const missingInputs = fullConfig.input.join()

      expect(() => normalizeOptions(fullConfig, runOptionsInit)).to.throw(
        `Invalid input! Options is missing keys(s) [${missingInputs}]`
      )
    })

    it('should not error out when there are extra run option inputs', () => {
      const runOptionsInit = {
        input: { username: 'johnnybravo', password: 'sunglasses' },
        folder: '/nonexistent'
      }
      const runOptions = normalizeOptions(fullConfig, runOptionsInit)
      const normalizedInput = runOptions['level_0_index_0'].input

      expect(normalizedInput).to.be.deep.equal({
        username: runOptionsInit.input.username
      })
    })
  })
})
