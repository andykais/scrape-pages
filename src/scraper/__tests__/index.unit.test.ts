import ScrapePages from '../index'
import * as globalVals from '../../../testing/setup'

describe('scrape-pages class', () => {
  const simpleConfig = globalVals.__SIMPLE_CONFIG__

  it('class loads', () => {
    const siteScraper = new ScrapePages(simpleConfig)
    // siteScraper.run()
  })
})
