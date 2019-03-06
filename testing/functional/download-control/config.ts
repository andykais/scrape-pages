import { ConfigInit } from '../../../src/settings/config/types'

export const config: ConfigInit = {
  scrapers: {
    index: {
      download: 'http://download-control.com/index.html',
      parse: {
        selector: 'li > a',
        attribute: 'href'
      }
    },
    postTitle: {
      download: 'http://download-control.com{{ value }}',
      parse: 'h1.article-title'
    }
  },
  run: {
    scraper: 'index',
    forEach: {
      scraper: 'postTitle'
    }
  }
}
