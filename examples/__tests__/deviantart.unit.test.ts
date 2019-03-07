import * as deviantartConfigJson from '../deviantart.config.json'
import { assertConfigType } from '../../src/settings/config'

// fixes webpack json import error https://github.com/webpack/webpack/issues/8504
const deviantartConfig = (deviantartConfigJson as any).default as typeof deviantartConfigJson

describe('deviantart config', () => {
  it('is properly typed', () => {
    assertConfigType(deviantartConfig)
  })

  // TODO
  // test('returns expected example output', () => {})
})
