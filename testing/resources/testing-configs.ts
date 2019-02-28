import { ConfigInit } from '../../src/settings/config/types'

// setup reusable variables
export const SIMPLE_CONFIG: ConfigInit = {
  scrapers: {
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
  run: {
    scraper: 'index',
    forEach: {
      scraper: 'image'
    }
  }
}

export const GALLERY_POST_IMG_TAG: ConfigInit = {
  scrapers: {
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
  run: {
    scraper: 'gallery',
    forEach: {
      scraper: 'post',
      forEach: [
        {
          scraper: 'tag'
        },
        {
          scraper: 'img-parse',
          forEach: {
            scraper: 'img'
          }
        }
      ]
    }
  }
}

export const EMPTY_CONFIG: ConfigInit = {
  scrapers: { identity: {} },
  run: { scraper: 'identity' }
}

export const INPUT_CONFIG: ConfigInit = {
  input: ['username'],
  scrapers: { identity: {} },
  run: { scraper: 'identity' }
}
