import { ConfigInit } from '../../../src/configuration/site-traversal/types'

export const config: ConfigInit = {
  scrape: {
    name: 'index-page',
    download: 'http://scrape-next-site.com/index.html',
    parse: '#batch-id',
    scrapeEach: {
      name: 'gallery',
      download: 'http://scrape-next-site.com/batch-id-page/id-{{ value }}.html',
      scrapeNext: {
        name: 'next-batch-id',
        parse: '#batch-id'
      },
      scrapeEach: {
        name: 'batch-page',
        parse: {
          selector: 'li > a',
          attribute: 'href'
        },
        scrapeEach: {
          name: 'image-page',
          download: 'http://scrape-next-site.com{{ value }}',
          scrapeEach: [
            {
              name: 'tag',
              parse: '#tags > li'
            },
            {
              name: 'image-parse',
              parse: {
                selector: 'img',
                attribute: 'src'
              },
              scrapeEach: {
                name: 'image',
                download: 'http://scrape-next-site.com{{ value }}'
              }
            }
          ]
        }
      }
    }
  }
}
