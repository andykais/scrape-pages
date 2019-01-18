import deviantartConfig from '../deviantart.config.json'
import { assertConfigType } from '../../src/settings/config'

describe('deviantart config', () => {
  it('is properly typed', () => {
    assertConfigType(deviantartConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
