import ScrapePages from '../index'

describe('scrape-pages class', () => {
  const simpleConfig = global.__SIMPLE_CONFIG__

  test('class loads', () => {
    const siteScraper = new ScrapePages(simpleConfig)
    // siteScraper.run()
  })
})
