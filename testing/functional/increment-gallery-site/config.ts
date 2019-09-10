import { ConfigInit } from '../../../src/settings/config/types'

export const config: ConfigInit = {
  flow: [
    {
      name: 'gallery',
      download: `http://increment-gallery-site.com/gallery-page/{{'+' 1 index }}.html`,
      parse: {
        selector: 'li > a',
        attribute: 'href'
      },
      incrementUntil: 'failed-download'
    },
    {
      scrape: {
        name: 'image-page',
        download: 'http://increment-gallery-site.com{{ value }}'
      },
      branch: [
        [
          {
            name: 'tag',
            parse: '#tags > li'
          }
        ],
        [
          {
            name: 'image-page-parse',
            parse: {
              selector: 'img',
              attribute: 'src'
            }
          },
          {
            name: 'image',
            download: {
              urlTemplate: 'http://increment-gallery-site.com{{ value }}',
              read: false,
              write: true
            }
          }
        ]
      ]
    }
  ]
}

// TODO add test for branching out then merging back in. We dont know if order will work properly
