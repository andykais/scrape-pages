import { ConfigInit } from '../../src/settings/config/types'

// setup reusable variables
export const SIMPLE_CONFIG: ConfigInit = {
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

export const GALLERY_POST_IMG_TAG: ConfigInit = {
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

export const EMPTY_CONFIG: ConfigInit = {
  defs: { identity: {} },
  structure: { scraper: 'identity' }
}

export const INPUT_CONFIG: ConfigInit = {
  input: ['username'],
  defs: { identity: {} },
  structure: { scraper: 'identity' }
}
