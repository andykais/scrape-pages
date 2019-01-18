import { ConfigInit } from '../../../src/settings/config/types'

export const config: ConfigInit = {
  scrape: {
    name: 'gallery',
    download: `http://increment-gallery-site.com/gallery-page/{{'+' 1 index }}.html`,
    parse: {
      selector: 'li > a',
      attribute: 'href'
    },
    incrementUntil: 'failed-download',
    scrapeEach: {
      name: 'image-page',
      download: 'http://increment-gallery-site.com{{ value }}',
      scrapeEach: [
        {
          name: 'tag',
          parse: '#tags > li'
        },
        {
          name: 'image-page-parse',
          parse: {
            selector: 'img',
            attribute: 'src'
          },
          scrapeEach: {
            name: 'image',
            download: 'http://increment-gallery-site.com{{ value }}'
          }
        }
      ]
    }
  }
}
