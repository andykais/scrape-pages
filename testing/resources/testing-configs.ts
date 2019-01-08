import { ConfigInit } from '../../src/configuration/site-traversal/types'

// setup reusable variables
export const __SIMPLE_CONFIG__: ConfigInit = {
  scrape: {
    download: 'example-site.com/images',
    parse: {
      selector: 'img',
      attribute: 'src'
    },
    scrapeEach: {
      download: '{value}'
    }
  }
}

export const __GALLERY_POST_IMG_TAG__: ConfigInit = {
  scrape: {
    name: 'gallery',
    download: 'https://gallery.com/cool', // save url before and after under name === gallery
    parse: {
      // save parsed 'post a' under name === gallery
      selector: 'post a',
      attribute: 'href'
    },
    scrapeEach: {
      name: 'post',
      download: '{value}', // save url under name === post
      // parse: undefined so flag it as identity in the db (no parsedValue)
      scrapeEach: [
        {
          name: 'tag',
          // download: undefined so flag it as identity in the db (no download url)
          parse: {
            // save parsed 'tags li' under name === tag
            selector: 'tags li'
          }
        },
        {
          name: 'img-parse',
          // download: undefined so flag it as identity in the db (no download url)
          parse: {
            // save parsed 'img src' under name === img-parse
            selector: 'img',
            attribute: 'src'
          },
          scrapeEach: {
            name: 'img',
            download: '{value}' // save url under name === img
          }
        }
      ]
    }
  }
}

export const __EMPTY_CONFIG__: ConfigInit = {
  scrape: {}
}

export const __INPUT_CONFIG__: ConfigInit = {
  input: ['username'],
  scrape: {}
}
