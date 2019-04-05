import { FMap } from '../../../util/map'
import { normalizeConfig } from '../../config'
import { normalizeOptions } from '../../options'
import { normalizeParams } from '../'
import * as testingConfigs from '../../../../testing/resources/testing-configs'
import { FlatParams, ScrapeParams } from '../types'
import { expect } from 'chai'

describe(__filename, () => {
  describe('simple config', () => {
    const config = normalizeConfig(testingConfigs.SIMPLE_CONFIG)
    const options = normalizeOptions(config, {})
    it('should match returned params', () => {
      const paramsInit = {
        folder: '/nonexistent'
      }
      const params = normalizeParams(config, options, paramsInit)
      const paramsExpected: FlatParams = FMap.fromObject<ScrapeParams>({
        index: {
          folder: '/nonexistent/index',
          input: {}
        },
        image: {
          folder: '/nonexistent/image',
          input: {}
        }
      })
      expect([...params]).to.have.deep.members([...paramsExpected])
    })
  })

  describe('config with input', () => {
    const config = normalizeConfig(testingConfigs.INPUT_CONFIG)
    const options = normalizeOptions(config, {})

    it('should error out when there is no input', () => {
      const missingInputs = config.input.join()
      const paramsInit = { folder: '/nonexistent' }

      expect(() => normalizeParams(config, options, paramsInit)).to.throw(
        `Invalid input! Params is missing keys(s) [${missingInputs}]`
      )
    })

    it('should not error out when there are extra param inputs', () => {
      const paramsInit = {
        input: { username: 'johnnybravo', password: 'sunglasses' },
        folder: '/nonexistent'
      }
      const flatParams = normalizeParams(config, options, paramsInit)
      const normalizedInput = flatParams.getOrThrow('identity').input

      expect(normalizedInput).to.deep.equal({
        username: paramsInit.input.username
      })
    })
  })
  describe('poorly formed params', () => {
    const config = normalizeConfig(testingConfigs.EMPTY_CONFIG)
    const options = normalizeOptions(config, {})
    const paramsInit: any = {}

    it('should throw a type assertion error', () => {
      expect(() => normalizeParams(config, options, paramsInit))
        .to.throw(`$: expected 'folder' in object`)
        .with.property('name', 'RuntimeTypeError')
    })
  })
})
