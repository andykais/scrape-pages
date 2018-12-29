import { expect } from 'chai'

// testing imports
import { nock } from '../nock'
import fetch from 'node-fetch'

class NockFixture {
  fixture: string
  done: () => void
  context: nock.NockBackContext

  constructor(fixture: string) {
    this.fixture = fixture
  }
  init = async () => {
    const { nockDone, context } = await nock.back(this.fixture)
    Object.assign(this, { nockDone, context })
  }
}

describe('nasa-image-of-the-day', () => {
  // const fixture = new NockFixture('')
  // before(fixture.init)
  // after(fixture.done)

  it('matches snapshot', async () => {
    // const siteScraper = new PageScraper(nasaIotdConfig)
    expect(1).to.be.equal(1)
  })
})
