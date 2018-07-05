import BaseScraper from './base-scraper'

class IdentityScraper extends BaseScraper {
  _run = () => async parentValue => [parentValue]
}

export default IdentityScraper
