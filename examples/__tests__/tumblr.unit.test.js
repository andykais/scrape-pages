// @flow
import tumblrConfig from '../tumblr.config'
import { assertConfigType } from '../../src/configuration/assert-config-type'

describe('tumblr config', () => {
  test('is properly typed', () => {
    assertConfigType(tumblrConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
