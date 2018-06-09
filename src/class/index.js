import fillInDefaults from '../configuration/fill-in-defaults'

class Scraper {
  constructor(scrapeConfig) {}

  _urlSaver = scraper => children => input => {}
  _scalarSaver = scraper => children => input => {}
  _identitySaver = scraper => children => input => {}
  _htmlParser = () => {}
  _jsonParser = () => {}
}

const walkConfigCreateScrapers = config => {
  if (config.scrape_each) {
    walkConfigCreateScrapers(config.scrape_each)
  } else {
    return
  }
}

class ScrapePages {
  constructor(config) {
    this.config = fillInDefaults(config)
    this.requiredInput = this.config.input
    this.scrapers = walkConfigCreateScrapers(this.config.scrape)
  }

  scrape = () => {}
}

export default ScrapePages
