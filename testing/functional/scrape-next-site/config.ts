import { ConfigInit } from '../../../src/settings/config/types'

export const config: ConfigInit = {
  flow: [
    {
      name: 'index-page',
      download: 'http://scrape-next-site.com/index.html',
      parse: '#batch-id'
    },
    {
      scrape: {
        name: 'gallery',
        download: 'http://scrape-next-site.com/batch-id-page/id-{{ value }}.html'
      },
      recurse: [
        [
          {
            name: 'next-batch-id',
            parse: '#batch-id'
          }
        ]
      ],
      branch: [
        [
          {
            name: 'batch-page',
            parse: {
              selector: 'li > a',
              attribute: 'href'
            }
          },
          {
            scrape: { name: 'image-page', download: 'http://scrape-next-site.com{{ value }}' },
            branch: [
              [{ name: 'tag', parse: '#tags > li' }],
              [
                {
                  name: 'image-parse',
                  parse: {
                    selector: 'img',
                    attribute: 'src'
                  }
                },
                {
                  name: 'image',
                  download: {
                    urlTemplate: 'http://scrape-next-site.com{{ value }}',
                    read: false,
                    write: true
                  }
                }
              ]
            ]
          }
        ]
      ]
    }
  ]
}

export const configFlattened: ConfigInit = {
  flow: [
    {
      name: 'index-page',
      download: 'http://scrape-next-site.com/index.html',
      parse: '#batch-id'
    },
    {
      scrape: {
        name: 'gallery',
        download: 'http://scrape-next-site.com/batch-id-page/id-{{ value }}.html'
      },
      recurse: [
        [
          {
            name: 'next-batch-id',
            parse: '#batch-id'
          }
        ]
      ]
    },
    {
      name: 'batch-page',
      parse: {
        selector: 'li > a',
        attribute: 'href'
      }
    },
    {
      scrape: { name: 'image-page', download: 'http://scrape-next-site.com{{ value }}' },
      branch: [
        [{ name: 'tag', parse: '#tags > li' }],
        [
          {
            name: 'image-parse',
            parse: {
              selector: 'img',
              attribute: 'src'
            }
          },
          {
            name: 'image',
            download: {
              urlTemplate: 'http://scrape-next-site.com{{ value }}',
              read: false,
              write: true
            }
          }
        ]
      ]
    }
  ]
}
