import ScrapePages from '../index'
import nasaIotdConfig from '../../../examples/nasa-image-of-the-day.config'

describe('scrape-pages class', () => {
  test('class loads', () => {
    const siteScraper = new ScrapePages(nasaIotdConfig)
  })
})
