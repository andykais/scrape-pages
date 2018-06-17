import BaseScraper from './base-scraper'

class IdentityScraper extends BaseScraper {
  flatten = runParams => runParams

  _run = () => async parentValue => {
    return [parentValue]
    // TODO investigate IdentityParser that isnt toplevel
    // return parentValue || []
  }
}

export default IdentityScraper
