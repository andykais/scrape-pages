import { ConfigInit } from '../../../src/settings/config/types'

export const config: ConfigInit = {
  scrapers: {
    gallery: {
      download: `http://increment-gallery-site.com/gallery-page/{{'+' 1 index }}.html`,
      parse: {
        selector: 'li > a',
        attribute: 'href'
      },
      incrementUntil: 'failed-download'
    },
    'image-page': {
      download: 'http://increment-gallery-site.com{{ value }}'
    },
    tag: {
      parse: '#tags > li'
    },
    'image-page-parse': {
      parse: {
        selector: 'img',
        attribute: 'src'
      }
    },
    image: {
      download: {
        urlTemplate: 'http://increment-gallery-site.com{{ value }}',
        read: false,
        write: true
      }
    }
  },
  run: {
    scraper: 'gallery',
    forEach: {
      scraper: 'image-page',
      forEach: [
        {
          scraper: 'tag'
        },
        {
          scraper: 'image-page-parse',
          forEach: {
            scraper: 'image'
          }
        }
      ]
    }
  }
}
