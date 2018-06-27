import Store from '../index'
import deviantartConfig from '../../../examples/deviantart.config'

describe('scrape-pages class', () => {
  const simpleConfig = global.__SIMPLE_CONFIG__

  test('class loads', () => {
    const store = new Store(deviantartConfig)
    // const siteScraper = new ScrapePages(simpleConfig)
    // siteScraper.run()
  })
})

