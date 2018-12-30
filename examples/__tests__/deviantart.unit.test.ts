import deviantartConfig from '../deviantart.config.json'
import { assertConfigType } from '../../src/configuration/site-traversal'

describe('deviantart config', () => {
  it('is properly typed', () => {
    assertConfigType(deviantartConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
