import deviantartConfig from '../deviantart.config'
import {assertConfigType}  from '../../src/configuration/assert-type'

describe('deviantart config', () => {
  test('is properly typed', () => {
    expect(deviantartConfig).toBeConfigType()
    assertConfigType(deviantartConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
