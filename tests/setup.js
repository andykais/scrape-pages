// @flow

import type { Config } from '../src/configuration/type'

// setup reusable variables

global.__SIMPLE_CONFIG__ = {
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
global.__GALLERY_POST_IMG_TAG__ = {
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
