import { ConfigInit } from '../../../src/settings/config/types'

export const config: ConfigInit = {
  defs: {
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
      download: 'http://increment-gallery-site.com{{ value }}'
    }
  },
  structure: {
    scraper: 'gallery',
    scrapeEach: {
      scraper: 'image-page',
      scrapeEach: [
        {
          scraper: 'tag'
        },
        {
          scraper: 'image-page-parse',
          scrapeEach: {
            scraper: 'image'
          }
        }
      ]
    }
  }
}
