import ScrapePages from '../index'
import * as globalVals from '../../../tests/setup'

describe('scrape-pages class', () => {
  const simpleConfig = globalVals.__SIMPLE_CONFIG__

  test('class loads', () => {
    const siteScraper = new ScrapePages(simpleConfig)
    // siteScraper.run()
  })
})