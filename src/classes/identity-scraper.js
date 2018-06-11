import BaseScraper from './base-scraper'

class IdentityScraper extends BaseScraper {
  flatten = runParams => runParams

  _run = runParams => {
    return [runParams]
    // TODO investigate IdentityParser that isnt toplevel
    // return parentValue || []
  }
}

export default IdentityScraper
