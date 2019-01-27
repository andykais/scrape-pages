import { ConfigInit } from '../../../src/settings/config/types'

export const config: ConfigInit = {
  defs: {
    'index-page': {
      download: 'http://scrape-next-site.com/index.html',
      parse: '#batch-id'
    },
    gallery: {
      download: 'http://scrape-next-site.com/batch-id-page/id-{{ value }}.html'
    },
    'next-batch-id': {
      parse: '#batch-id'
    },
    'batch-page': {
      parse: {
        selector: 'li > a',
        attribute: 'href'
      }
    },
    'image-page': {
      download: 'http://scrape-next-site.com{{ value }}'
    },
    tag: {
      parse: '#tags > li'
    },
    'image-parse': {
      parse: {
        selector: 'img',
        attribute: 'src'
      }
    },
    image: {
      download: 'http://scrape-next-site.com{{ value }}'
    }
  },
  structure: {
    scraper: 'index-page',
    scrapeEach: {
      scraper: 'gallery',
      scrapeNext: {
        scraper: 'next-batch-id'
      },
      scrapeEach: {
        scraper: 'batch-page',
        scrapeEach: {
          scraper: 'image-page',
          scrapeEach: [
            {
              scraper: 'tag'
            },
            {
              scraper: 'image-parse',
              scrapeEach: {
                scraper: 'image'
              }
            }
          ]
        }
      }
    }
  }
}
