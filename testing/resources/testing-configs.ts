import { ConfigInit } from '../../src/settings/config/types'

// setup reusable variables
export const __SIMPLE_CONFIG__: ConfigInit = {
  defs: {
    index: {
      download: 'example-site.com/images',
      parse: {
        selector: 'img',
        attribute: 'src'
      }
    },
    image: {
      download: '{value}'
    }
  },
  structure: {
    scraper: 'index',
    scrapeEach: {
      scraper: 'image'
    }
  }
}

export const __GALLERY_POST_IMG_TAG__: ConfigInit = {
  defs: {
    gallery: {
      download: 'https://gallery.com/cool', // save url before and after under name === gallery
      parse: {
        // save parsed 'post a' under name === gallery
        selector: 'post a',
        attribute: 'href'
      }
    },
    tag: {
      // download: undefined so flag it as identity in the db (no download url)
      parse: {
        // save parsed 'tags li' under name === tag
        selector: 'tags li'
      }
    },
    post: {
      download: '{value}' // save url under name === post
      // parse: undefined so flag it as identity in the db (no parsedValue)
    },
    'img-parse': {
      // download: undefined so flag it as identity in the db (no download url)
      parse: {
        // save parsed 'img src' under name === img-parse
        selector: 'img',
        attribute: 'src'
      }
    },
    img: {
      download: '{value}' // save url under name === img
    }
  },
  structure: {
    scraper: 'gallery',
    scrapeEach: {
      scraper: 'post',
      scrapeEach: [
        {
          scraper: 'tag'
        },
        {
          scraper: 'img-parse',
          scrapeEach: {
            scraper: 'img'
          }
        }
      ]
    }
  }
}

export const __EMPTY_CONFIG__: ConfigInit = {
  defs: { identity: {} },
  structure: { scraper: 'identity' }
}

export const __INPUT_CONFIG__: ConfigInit = {
  input: ['username'],
  defs: { identity: {} },
  structure: { scraper: 'identity' }
}
