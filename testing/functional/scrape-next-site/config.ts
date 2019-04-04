import { ConfigInit } from '../../../src/settings/config/types'

export const config: ConfigInit = {
  scrapers: {
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
      download: {
        urlTemplate: 'http://scrape-next-site.com{{ value }}',
        read: false,
        write: true
      }
    }
  },
  run: {
    scraper: 'index-page',
    forEach: {
      scraper: 'gallery',
      forNext: {
        scraper: 'next-batch-id'
      },
      forEach: {
        scraper: 'batch-page',
        forEach: {
          scraper: 'image-page',
          forEach: [
            {
              scraper: 'tag'
            },
            {
              scraper: 'image-parse',
              forEach: {
                scraper: 'image'
              }
            }
          ]
        }
      }
    }
  }
}
