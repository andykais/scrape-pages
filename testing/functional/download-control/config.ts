import { ConfigInit } from '../../../src/settings/config/types'

export const config: ConfigInit = {
  flow: [
    {
      name: 'index',
      download: 'http://download-control.com/index.html',
      parse: {
        selector: 'li > a',
        attribute: 'href'
      }
    },
    {
      name: 'postTitle',
      download: 'http://download-control.com{{ value }}',
      parse: 'h1.article-title'
    }
  ]
}

export const configBranching: ConfigInit = {
  flow: [
    {
      scrape: {
        name: 'index',
        download: 'http://download-control.com/index.html',
        parse: {
          selector: 'li > a',
          attribute: 'href'
        }
      },
      branch: [
        [
          {
            name: 'postTitle',
            download: 'http://download-control.com{{ value }}',
            parse: 'h1.article-title'
          }
        ],
        [
          {
            name: 'postTitle_dup',
            download: 'http://download-control.com{{ value }}',
            parse: 'h1.article-title'
          }
        ]
      ]
    }
  ]
}
