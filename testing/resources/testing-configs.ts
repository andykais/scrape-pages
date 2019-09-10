import { ConfigInit } from '../../src/settings/config/types'

// setup reusable variables
export const SIMPLE_CONFIG: ConfigInit = {
  flow: [
    {
      name: 'index',
      download: 'example-site.com/images',
      parse: {
        selector: 'img',
        attribute: 'src'
      }
    },
    {
      name: 'image',
      download: '{value}'
    }
  ]
}

export const GALLERY_POST_IMG_TAG: ConfigInit = {
  flow: [
    {
      name: 'gallery',
      download: 'https://gallery.com/cool', // save url before and after under name === gallery
      parse: {
        // save parsed 'post a' under name === gallery
        selector: 'post a',
        attribute: 'href'
      }
    },
    {
      scrape: {
        name: 'post',
        download: '{value}' // save url under name === post
        // parse: undefined so flag it as identity in the db (no parsedValue)
      },
      branch: [
        [
          {
            name: 'tag',
            // download: undefined so flag it as identity in the db (no download url)
            parse: {
              // save parsed 'tags li' under name === tag
              selector: 'tags li'
            }
          }
        ],
        [
          {
            name: 'img-parse',
            // download: undefined so flag it as identity in the db (no download url)
            parse: {
              // save parsed 'img src' under name === img-parse
              selector: 'img',
              attribute: 'src'
            }
          },
          {
            name: 'img',
            download: '{value}' // save url under name === img
          }
        ]
      ]
    }
  ]
}

export const EMPTY_CONFIG: ConfigInit = {
  flow: []
}

export const INPUT_CONFIG: ConfigInit = {
  input: ['username'],
  flow: [
    {
      name: 'identity'
    }
  ]
}
