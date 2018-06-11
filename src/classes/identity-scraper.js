import BaseScraper from './base-scraper'

class IdentityScraper extends BaseScraper {
  flatten = (acc, val) => [...acc, val]

  _run = ({ parentValue }) => {
    // TODO investigate IdentityParser that isnt toplevel
    return parentValue || []
  }
}

export default IdentityScraper
