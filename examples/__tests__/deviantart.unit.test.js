import deviantartConfig from '../deviantart.config'
import { assertConfigType } from '../../src/configuration'

describe('deviantart config', () => {
  test('is properly typed', () => {
    assertConfigType(deviantartConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
